import React, { useState, Fragment, useEffect, createContext } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup';
import { getGroupInfo } from './util.js'
import Table from 'react-bootstrap/Table';
import '../css/task.css';
import { PairCanvas } from './canvas.js'

// export const TableDataContext = createContext();
const initItems = {
    'Group1': {
        no: 0,
        name: '',
        cam_count: 0,
        status: '',
        job_id: 0,
        status_msg: '',
        gen_id: 0,
        gen_msg: '',
    },
}

export const TaskGroupTable = ({ taskId, taskPath }) => {
    console.log("Task Group Table ", taskId, taskPath);
    const CAL_STATE = {
        ERR: -1,
        READY: 0,
        START: 1,
        COMPLETE: 2,
        CANCEL: 3,
        PAIR_COMPLETE: 4,
        SUBMIT: 5,
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
        } else if (type === 'changestatus') {
            groupTable[param[0]].status = param[1]
        } else if (type === 'changestatusmsg') {
            groupTable[param[0]].status_msg = param[1]
        }
        else if (type === 'addjobid') {
            groupTable[param[0]].job_id = param[1]
        } else if (type === 'addgenid') {
            groupTable[param[0]].gen_id = param[1]
            groupTable[param[0]].status = CAL_STATE.SUBMIT
            setLeftImage('')
            setRightImage('')

        } else if (type === 'changegenmsg') {
            groupTable[param[0]].gen_msg = param[1]
            setRefresh(refresh + 1)
        }

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
    const TaskRow = ({ keyindex }) => {
        console.log("taskRow start.. ", keyindex)
        const [jobId, setJobId] = useState('')
        const [requestId, setRequestId] = useState('')
        const [calState, setCalState] = useState(CAL_STATE.READY)
        const [statusMessage, setStatusMessage] = useState('')
        const [genMessage, setGenMessage] = useState('')

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
                setStatusMessage(` Unable to calculate! ${err}`);
                return;
            }

            if (response && response.data.status === 0) {
                setJobId(response.data.job_id);
                setRequestId(response.data.request_id);
                setCalState(CAL_STATE.START);
                const strmsg = `Request Calculate. Job id ${response.data.job_id}`
                setStatusMessage(strmsg);
                changeTableDataContext('changestatusmsg', [keyindex, strmsg]);
                changeTableDataContext('addjobid', [keyindex, response.data.job_id]);
                console.log(" check .. ", groupTable);
            }
        }

        const getStatusSend = async () => {
            console.log("getStatusSend is called " + jobId);
            let response = null;

            try {
                response = await axios.get(process.env.REACT_APP_SERVER_URL + `/api/calculate/status/${jobId}`)

            } catch (err) {
                console.log(err)
                setStatusMessage(err);
                return;
            }

            if (response && response.data.percent) {
                let strmsg = ''
                if (parseInt(response.data.percent) === 100) {
                    setCalState(CAL_STATE.COMPLETE);
                    if (response.data.result >= 0) {
                        strmsg = ` ${jobId} Done. ${response.data.percent}%`;
                    } else {
                        strmsg = ` ${jobId} Err: ${response.data.result} ${response.data.message}`;
                    }
                } else {
                    strmsg = ` ${jobId} Processing .. ${response.data.percent}%`;
                    setCalState(CAL_STATE.ERR);
                }

                setStatusMessage(strmsg)
                changeTableDataContext('changestatusmsg', [keyindex, strmsg]);
            }
        }

        const TaskRowRequest = ({ keyindex }) => {
            console.log("taskrow request recieve : ", keyindex);
            console.log(groupTable)

            const onCalculateClick = () => {
                calculate(taskId, taskPath, keyindex);
                setCalState(CAL_STATE.START);
            }

            const onCancelClick = async () => {
                console.log("cancle send datacontext 2 : ", keyindex)

                let response = null;

                try {
                    response = await axios.delete(process.env.REACT_APP_SERVER_URL + `/api/cancel/${groupTable[keyindex].job_id}`);
                } catch (err) {
                    console.log(err);
                    setStatusMessage('Unable to cancel');
                    return;
                }

                if (response && response.data.status === 0) {
                    setCalState(CAL_STATE.CANCEL);
                    setStatusMessage('Canceled.');
                }
            }

            return (
                <>
                    <Button size="sm"
                        as="input"
                        type='button'
                        value="Calculate"
                        onClick={onCalculateClick}
                        hidden={groupTable[keyindex].cam_count < 5}
                        disabled={calState !== CAL_STATE.READY}>
                    </Button>{' '}
                    <Button size="sm"
                        as="input"
                        type='button'
                        className="btn-danger"
                        value="Cancel"
                        onClick={onCancelClick}
                        hidden={groupTable[keyindex].cam_count < 5}
                        disabled={calState !== CAL_STATE.START}>
                    </Button>{' '}
                </>

            )
        }

        const TaskRowStatus = ({ keyindex }) => {
            // console.log("taskrow status recieve : ", group);

            const onGetStatus = () => {
                getStatusSend();
            }

            return (
                <>
                    <Button size="sm"
                        as="input"
                        type='button'
                        value="Status"
                        onClick={onGetStatus}
                        hidden={groupTable[keyindex].cam_count < 5}
                        disabled={calState === CAL_STATE.READY || calState === CAL_STATE.CANCEL}>
                    </Button>{' '}
                    <span id="span-msg">
                        {groupTable[keyindex].status_msg}
                    </span>
                </>
            )
        }

        const TaskRowGenerate = ({ keyindex }) => {

            const onGetStatus = () => {
                getStatusSend();
            }

            const onGetPairClick = async () => {
                let response = null;

                try {
                    console.log(groupTable[keyindex].job_id)
                    response = await axios.get(process.env.REACT_APP_SERVER_URL + `/api/image/${groupTable[keyindex].job_id}`);
                } catch (err) {
                    console.log(err);
                    setStatusMessage('Unable to get images!');
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
                    setCalState(CAL_STATE.PAIR_COMPLETE);
                    setCanvasJob([jobId, taskId, keyindex])
                    changeTableDataContext('changegenmsg', [keyindex, `${response.data.first_image}, ${response.data.first_image} is chosen`])
                } else {
                    return;
                }


            }

            console.log(" moment draw taskrow generate ", calState);
            return (
                <>
                    <Button size="sm"
                        as="input"
                        type='button'
                        variant="success"
                        value="Pick Point"
                        onClick={onGetPairClick}
                        hidden={groupTable[keyindex].cam_count < 5}
                        disabled={calState !== CAL_STATE.COMPLETE && calState !== CAL_STATE.PAIR_COMPLETE}
                    >
                    </Button>{'  '}
                    <span id="span-msg">
                        {groupTable[keyindex].gen_msg}
                    </span>
                </>
            )
        }

        const TaskRowResult = ({ keyindex }) => {
            const onCheckedElement = (checked, item) => {
                console.log("onchekced element ", checked);
                if (checked) {
                    setCheckedList([...checkedList, item]);
                } else if (!checked) {
                    setCheckedList(checkedList.filter(el => el !== item));
                }
                console.log("onChecked Element : ", checkedList);
            }
            console.log(" moment draw taskrow result ", calState);
            return (
                <div>
                    <InputGroup.Checkbox disabled={groupTable[keyindex].cam_count < 5 || calState !== CAL_STATE.PAIR_COMPLETE}
                        onChange={(e) => onCheckedElement(e.target.checked, groupTable[keyindex].no)}
                        checked={checkedList.includes(groupTable[keyindex].no) ? true : false} />
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
        console.log("GroupTable.. ", keys)

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

    const downloadResult = () => {
        // saveAs(downloadInfo.url, downloadInfo.name);
        // setIsSubmitted(false)
        console.log("download result clicked ", checkedList);
    }

    const getGroup = async (taskId) => {
        console.log("set task load true ", taskId);
        let modify_group = {};
        if (taskId !== '') {
            console.log("get group call..  ");
            try {
                const group = await getGroupInfo(taskId);
                // for (const g of group) {
                //     g['status'] = '';
                //     g['job_id'] = '';
                //     modify_group[g.group_id] = g
                // }
                setGroupInfo(group)
                // setGroupTable(modify_group)
                changeTableDataContext('init', [group])
                setTableLoad(true)
                console.log("modify data structure save : ", groupTable)

            } catch (err) {
                console.log("getGroup info error : ", err);
            }
        }
    }

    useEffect(() => {
        console.log('start .. :', taskId);
        getGroup(taskId);
    }, [taskId]);

    useEffect(() => {
        console.log("use effect groupTable ")
    }, [groupTable])

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
