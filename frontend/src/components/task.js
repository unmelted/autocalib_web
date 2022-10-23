import React, { useState, Fragment, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup';
import { getGroupInfo } from './util.js'
import Table from 'react-bootstrap/Table';
import '../css/task.css';
import { PairCanvas } from './canvas.js'

const initItems = {
    'Group1': {
        no: 0,
        post_no: 0,
        name: '',
        cam_count: 0,
        status: '',
        job_id: 0,
        status_msg: '',
        gen_id: 0,
        gen_msg: '',
    },
}

export const TaskGroupTable = ({ taskId, taskPath, entry }) => {
    // console.log("Task Group Table ", taskId, taskPath);
    const CAL_STATE = {
        ERR: -1,
        READY: 0,
        START: 1,
        CAL_COMPLETE: 2,
        CANCEL: 3,
        PAIR_COMPLETE: 4,
        SUBMIT: 5,
        GEN_COMPLETE: 6,
    }

    const [refresh, setRefresh] = useState(0)
    const [groupInfo, setGroupInfo] = useState('');
    const [groupTable, setGroupTable] = useState(initItems);

    const [tableLoad, setTableLoad] = useState(false);
    const [downloadInfo, setDownloadInfo] = useState({});
    const [leftImage, setLeftImage] = useState('');
    const [rightImage, setRightImage] = useState('');
    const [canvasJob, setCanvasJob] = useState('')
    const [checkedList, setCheckedList] = useState([])

    const changeTableDataContext = (type, param) => {
        console.log("changeTableContext", type, param);
        if (type === 'init') {
            // groupTable = {};
            for (const g of param[0]) {
                console.log("inner loop : ", g)
                let tempval = {}
                tempval.name = g.group_id;
                tempval.no = g.no;
                tempval.post_no = -1;
                tempval.cam_count = g.cam_count;
                tempval.status = CAL_STATE.READY;
                tempval.job_id = 0;
                tempval.status_msg = '';
                tempval.gen_id = 0;
                tempval.gen_msg = '';
                groupTable[g.group_id] = tempval;
                // groupTable[g.group_id].name = g.group_id;
                // groupTable[g.group_id].no = g.no;
                // groupTable[g.group_id].cam_count = g.cam_count;
                // groupTable[g.group_id].status = CAL_STATE.READY;
                // groupTable[g.group_id].job_id = 0;
                // groupTable[g.group_id].status_msg = '';
                // groupTable[g.group_id].gen_id = 0;
                // groupTable[g.group_id].gen_msg = '';
            }
        } else if (type === 'addpostno') {
            groupTable[param[0]].post_no = param[1]

        } else if (type === 'changestatus') {
            groupTable[param[0]].status = param[1]

        } else if (type === 'changestatusmsg') {
            groupTable[param[0]].status_msg = param[1]
        }
        else if (type === 'addjobid') {
            groupTable[param[0]].job_id = param[1]
        }
        else if (type === 'addrequestid') {
            groupTable[param[0]].no = param[1]
        } else if (type === 'addgenid') {
            groupTable[param[0]].gen_id = param[1]
            groupTable[param[0]].status = CAL_STATE.SUBMIT
            setLeftImage('')
            setRightImage('')
            // groupTable[param[0]].timer_id = setInterval(() => {
            //     groupTable[param[0]].timer -= 1;
            // }, 5000);

        } else if (type === 'changegenmsg') {
            groupTable[param[0]].gen_msg = param[1]
        }
        setRefresh(refresh + 1)
    }

    const changeGenData = (type, param) => {
        console.log('changeGenData', type, param)
        changeTableDataContext(type, param);
    }

    const Canvas = () => {
        if (rightImage !== '' && leftImage !== '') {
            console.log("Canvas is called 1 : " + rightImage)
            console.log("Canvas is called 2 : " + canvasJob)
            return (
                <>
                    <PairCanvas enter={'task'} leftImage={leftImage} rightImage={rightImage} jobId={canvasJob[0]} taskId={canvasJob[1]} groupId={canvasJob[2]} changeHandle={changeGenData}></PairCanvas>
                </>)

        }
        else {
            return <></>
        }

    }

    const getGroupStatus = async (keyindex) => {
        console.log(groupTable[keyindex], groupTable[keyindex].no)
        let response = null;
        try {
            response = await axios.get(process.env.REACT_APP_SERVER_URL + `/control/groupstatus/${groupTable[keyindex].no}`)
        } catch (err) {
            console.log(err)
        }

        if (response) {

            if (response.data.request_id === 0) {
                // changeTableDataContext('changestatus', [keyindex, CAL_STATE.READY])
            }
            else if (response.data.request_id > 0) {
                changeTableDataContext('addrequestid', [keyindex, response.data.request_id])
                changeTableDataContext('addjobid', [keyindex, response.data.job_id])
                changeTableDataContext('changestatus', [keyindex, CAL_STATE.CAL_COMPLETE])
            }
        }
    }

    const TaskRow = ({ keyindex }) => {
        console.log("taskRow start.. ", keyindex)
        const [jobId, setJobId] = useState('')
        const [requestId, setRequestId] = useState('')

        const calculate = async (taskId, taskPath, groupId) => {
            console.log("before calculate " + taskId + " " + groupId);

            const data = {
                task_id: taskId,
                task_path: taskPath,
                group_id: groupId
            }

            let response = null;

            try {
                response = await axios.post(process.env.REACT_APP_SERVER_URL + "/api/calculate", data);
            } catch (err) {
                console.log(err);
                changeTableDataContext('changestatusmsg', [keyindex, `Unable to calculate ${err}`]);
                return;
            }

            if (response && response.data.status === 0) {
                setJobId(response.data.job_id);
                setRequestId(response.data.request_id);

                const strmsg = `Request Calculate. Job id ${response.data.job_id}`
                changeTableDataContext('changestatus', [keyindex, CAL_STATE.START]);
                changeTableDataContext('changestatusmsg', [keyindex, strmsg]);
                changeTableDataContext('addjobid', [keyindex, response.data.job_id]);
                console.log(" check .. ", groupTable);
            }
        }

        const getStatusSend = async (job_id) => {
            console.log("getStatusSend is called " + job_id);
            let response = null;

            try {
                response = await axios.get(process.env.REACT_APP_SERVER_URL + `/api/calculate/status/${job_id}`)

            } catch (err) {
                console.log(err)
                changeTableDataContext('changestatusmsg', [keyindex, `Unable to get status  ${err}`]);
                return;
            }

            if (response && response.data.percent) {
                let strmsg = ''
                if (parseInt(response.data.percent) === 100) {
                    changeTableDataContext('changestatus', [keyindex, CAL_STATE.CAL_COMPLETE]);
                    if (response.data.result >= 0) {
                        strmsg = ` ${jobId} Done. ${response.data.percent}%`;
                    } else {
                        strmsg = ` ${jobId} Err: ${response.data.result} ${response.data.message}`;
                        changeTableDataContext('changestatus', [keyindex, CAL_STATE.ERR]);
                    }
                } else {
                    strmsg = ` ${jobId} Processing .. ${response.data.percent}%`;
                    changeTableDataContext('changestatus', [keyindex, CAL_STATE.START]);
                }
                changeTableDataContext('changestatusmsg', [keyindex, strmsg]);
            }
        }

        const TaskRowRequest = ({ keyindex }) => {

            const onCalculateClick = () => {
                calculate(taskId, taskPath, keyindex);
                changeTableDataContext('changestatus', [keyindex, CAL_STATE.START]);
            }

            const onCancelClick = async () => {
                console.log("cancle send datacontext 2 : ", keyindex)

                let response = null;

                try {
                    response = await axios.delete(process.env.REACT_APP_SERVER_URL + `/api/cancel/${groupTable[keyindex].job_id}`);
                } catch (err) {
                    console.log(err);
                    changeTableDataContext('changestatusmsg', [keyindex, `Unable to cancel ${err}`]);
                    return;
                }

                if (response && response.data.status === 0) {
                    changeTableDataContext('changestatus', [keyindex, CAL_STATE.CANCEL]);
                }
            }

            console.log(" draw taskrow request ", keyindex, groupTable[keyindex].status);

            return (
                <>
                    <Button size="sm"
                        as="input"
                        type='button'
                        value="Calculate"
                        onClick={onCalculateClick}
                        hidden={groupTable[keyindex].cam_count < 5}
                        disabled={groupTable[keyindex].status !== CAL_STATE.READY}>
                    </Button>{' '}
                    <Button size="sm"
                        as="input"
                        type='button'
                        className="btn-danger"
                        value="Cancel"
                        onClick={onCancelClick}
                        hidden={groupTable[keyindex].cam_count < 5}
                        disabled={groupTable[keyindex].status !== CAL_STATE.START && groupTable[keyindex].status !== CAL_STATE.CANCEL}>
                    </Button>{' '}
                </>

            )
        }

        const TaskRowStatus = ({ keyindex }) => {
            console.log("taskrow status recieve : ", keyindex, groupTable[keyindex].status);

            const onGetStatus = () => {
                getStatusSend(groupTable[keyindex].job_id);
            }

            return (
                <>
                    <Button size="sm"
                        as="input"
                        type='button'
                        value="Status"
                        onClick={onGetStatus}
                        hidden={groupTable[keyindex].cam_count < 5}
                        disabled={groupTable[keyindex].status === CAL_STATE.READY || groupTable[keyindex].status === CAL_STATE.CANCEL}>
                    </Button>{' '}
                    <span id="span-msg">
                        {groupTable[keyindex].status_msg}
                    </span>
                </>
            )
        }

        const TaskRowGenerate = ({ keyindex }) => {

            const onGetStatus = () => {
                getStatusSend(groupTable[keyindex].job_id);
            }

            const onGetPairClick = async () => {
                let response = null;

                try {
                    console.log(groupTable[keyindex].job_id)
                    response = await axios.get(process.env.REACT_APP_SERVER_URL + `/api/image/${groupTable[keyindex].job_id}`);
                } catch (err) {
                    console.log(err);
                    changeTableDataContext('changestatusmsg', [keyindex, `Unable to get image  ${err}`]);
                    return;
                }

                const imageUrl = process.env.REACT_APP_SERVER_IMAGE_URL + '/' + taskId + '/';

                if (response && response.data.status === 0) {
                    const imageUrlFirst = imageUrl + response.data.first_image;
                    const imageUrlSecond = imageUrl + response.data.second_image;
                    console.log(imageUrlFirst)
                    console.log(imageUrlSecond)
                    setLeftImage(imageUrlFirst);
                    setRightImage(imageUrlSecond);
                    setCanvasJob([groupTable[keyindex].job_id, taskId, keyindex])
                    changeTableDataContext('changestatus', [keyindex, CAL_STATE.PAIR_COMPLETE]);
                    changeTableDataContext('changegenmsg', [keyindex, `${response.data.first_image}, ${response.data.first_image} is chosen`])
                } else {
                    return;
                }


            }

            console.log(" draw taskrow generate ", keyindex, groupTable[keyindex].status);
            return (
                <>
                    <Button size="sm"
                        as="input"
                        type='button'
                        variant="success"
                        value="Pick Point"
                        onClick={onGetPairClick}
                        hidden={groupTable[keyindex].cam_count < 5}
                        disabled={groupTable[keyindex].status !== CAL_STATE.CAL_COMPLETE && groupTable[keyindex].status !== CAL_STATE.PAIR_COMPLETE}
                    >
                    </Button>{'  '}
                    <span id="span-msg">
                        {groupTable[keyindex].gen_msg}
                    </span>
                </>
            )
        }

        const TaskRowResult = ({ keyindex }) => {
            const onGetGenStatusClick = async () => {
                console.log('onGetGenStatus Click')
                let response = null;

                try {
                    response = await axios.get(process.env.REACT_APP_SERVER_URL + `/api/calculate/status/${groupTable[keyindex].gen_id}`)

                } catch (err) {
                    console.log(err)
                    return;
                }

                if (response && response.data.percent) {
                    let strmsg = ''
                    if (parseInt(response.data.percent) === 100) {
                        if (response.data.result >= 0) {
                            strmsg = ` ${groupTable[keyindex].gen_id} Done. ${response.data.percent}%`;
                            console.log('will call change table data context', keyindex)
                            changeTableDataContext('changestatus', [keyindex, CAL_STATE.GEN_COMPLETE]);
                        } else {
                            strmsg = ` ${groupTable[keyindex].gen_id} Err: ${response.data.result} ${response.data.message}`;
                            changeTableDataContext('changestatus', [keyindex, CAL_STATE.ERR]);
                        }
                    } else {
                        strmsg = ` ${groupTable[keyindex].gen_id} Processing .. ${response.data.percent}%`;
                    }
                    changeTableDataContext('changegenmsg', [keyindex, strmsg]);
                }

            }

            const onCheckedElement = (checked, item) => {
                console.log("onchekced element ", checked);
                if (checked) {
                    setCheckedList([...checkedList, item]);
                } else if (!checked) {
                    setCheckedList(checkedList.filter(el => el !== item));
                }
                console.log("onChecked Element : ", checkedList);
            }
            console.log(" draw taskrow result ", keyindex, groupTable[keyindex].status);
            return (
                <div>
                    <Button size="sm"
                        as="input"
                        type='button'
                        value="Get"
                        onClick={onGetGenStatusClick}
                        hidden={groupTable[keyindex].cam_count < 5 || groupTable[keyindex].status === CAL_STATE.GEN_COMPLETE}
                        disabled={groupTable[keyindex].status !== CAL_STATE.SUBMIT}
                    >
                    </Button>
                    <div hidden={groupTable[keyindex].status !== CAL_STATE.GEN_COMPLETE} >
                        <InputGroup.Checkbox hidden={groupTable[keyindex].cam_count < 5}
                            // disabled={groupTable[keyindex].status !== CAL_STATE.GEN_COMPLETE}
                            onChange={(e) => onCheckedElement(e.target.checked, groupTable[keyindex].post_no)}
                            checked={checkedList.includes(groupTable[keyindex].post_no) ? true : false} />
                    </div>
                </div >
            )
        }

        return (
            <>
                <td id="td-request">
                    <TaskRowRequest keyindex={keyindex}></TaskRowRequest>
                </td>
                <td id="td-status">
                    <TaskRowStatus keyindex={keyindex}></TaskRowStatus>
                </td>
                <td id="td-generate">
                    <TaskRowGenerate keyindex={keyindex}></TaskRowGenerate>
                </td>
                <td id="td-result">
                    <TaskRowResult keyindex={keyindex}></TaskRowResult>
                </td>
            </>
        )

    }

    const GroupTable = ({ groupTable }) => {
        const keys = Object.keys(groupTable)
        // console.log("GroupTable.. ", keys)

        return (
            keys.map((keyindex =>
                <tr key={groupTable[keyindex].no} >
                    <td> {groupTable[keyindex].name}</td>
                    <td> {groupTable[keyindex].cam_count}</td>
                    <TaskRow keyindex={keyindex}></TaskRow>
                </tr>
            )
            ));
    };

    const downloadResult = async () => {

        console.log('download result click checked in task: ', checkedList)
        const data = {
            request_ids: checkedList,
        }

        let response = null;
        try {
            response = await axios.post(process.env.REACT_APP_SERVER_URL + `/control/getresult`, data)
        }
        catch (err) {
            console.log('get result err ', err)
        }

        if (response && response.data.status === 0) {
            console.log(response)
            saveAs(response.data.download_url, response.data.filename);
        }
    }

    const getGroup = async (taskId, entry) => {
        console.log("set task load true ", taskId);
        if (taskId !== '') {
            console.log("get group call..  ");
            try {
                const group = await getGroupInfo(taskId);
                setGroupInfo(group)
                changeTableDataContext('init', [group])

            } catch (err) {
                console.log("getGroup info error : ", err);
                return;
            }

            if (entry === 'history') {
                const keys = Object.keys(groupTable)
                console.log("GroupTable.. ", keys)
                for await (const key of keys) {
                    await getGroupStatus(key)
                }
            }

            setTableLoad(true)
        }
    }

    useEffect(() => {
        console.log('start .. :', taskId, entry);
        getGroup(taskId, entry);
    }, [taskId]);

    // useEffect(() => {
    //     console.log("use effect refresh ")
    // }, [refresh])

    // task main retrun 
    if (tableLoad === false) {
        return (<div />)
    }
    else {

        return (
            <Fragment >
                <div className='table-container'>
                    <p id="task-title" > CURRENT TASK ID : {taskId} </p>
                    <Table id="table-body" striped bordered variant="dark">
                        <thead>
                            <tr>
                                <th id="th-name">Group Name</th>
                                <th id="th-count">Camera Count</th>
                                <th id="th-request">Request</th>
                                <th id="th-status">Status</th>
                                <th id="th-generate">Generate</th>
                                <th id="th-result">Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* <GroupTable groups={groupInfo}></GroupTable> */}
                            <GroupTable groupTable={groupTable}></GroupTable>
                        </tbody>
                    </Table>
                    <div id="button-row-down" >
                        <Button
                            size="sm"
                            variant="primary"
                            className="item-btn-wrapper"
                            id='result'
                            as="input"
                            type='button'
                            value="DownLoad"
                            onClick={downloadResult}
                            disabled={checkedList.length === 0}>
                        </Button>
                    </div>
                </div>
                <div className='canvas-container'>
                    {/* <TableDataContext.Provider value={{ groupTable, changeTableDataContext }}> */}
                    <Canvas></Canvas>
                    {/* </TableDataContext.Provider> */}
                </div>
            </Fragment >
        )
    };
};
