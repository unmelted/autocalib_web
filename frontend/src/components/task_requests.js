import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import Button from 'react-bootstrap/Button'
import { Form } from 'react-bootstrap'
import InputGroup from 'react-bootstrap/InputGroup';
import Table from 'react-bootstrap/Table';

import '../css/task_library.css';
import { commonData } from '../App';
import { configData } from '../App.js'

// import { PairCanvas } from './canvas.js'
// import { ReviewGallery } from './gallery.js';
// import { PositionTracking } from './position_tracking.js';
// import { TaskUnityTable } from './task_unity.js';

// let taskCarriage = {
//     task: [],
//     task_loaded: false,
//     requestGrouploaded: false,
//     requestHistoryLoaded: false,
//     requestUnityTable: true,
//     task_id: '',
//     task_path: '',
//     leftImage: '',
//     rigbtImage: '',
//     ptShow: false,
//     checkedList: []
// };
// // 
/* export const TaskRequestHistory = async ({ from }) => {

    const today = new Date();
    let fromdate = new Date()
    fromdate.setDate(today.getDate() - 7);
    const todate = today.toLocaleDateString();
    const daterange = fromdate.toLocaleDateString() + ' - ' + todate

    const [tasks, setTasks] = useState('');
    const [tasksLoaded, setTasksLoaded] = useState(false);

    const onHandleHistoryClick = async (taskId) => {
        console.log("onHandleRequest buttoin click", taskId);
        taskCarriage['checkedList'] = [];
        taskCarriage['task_id'] = taskId;
        taskCarriage['leftImage'] = '';
        taskCarriage['rigbtImage'] = '';
        taskCarriage['ptShow'] = false;

        // getRequestHistory(taskId);
    }

    const onHandleRequestClick = async (taskId, task_path) => {
        console.log("onHandleRequestClck !! ")
        taskCarriage['checkedList'] = [];
        taskCarriage['task_id'] = taskId;
        taskCarriage['task_path'] = task_path;
        taskCarriage['leftImage'] = '';
        taskCarriage['rigbtImage'] = '';
        taskCarriage['ptShow'] = false;

        taskCarriage['requestGrouploaded'] = true;
        taskCarriage['requestHistoryLoaded'] = false;
        taskCarriage['leftImage'] = '';
        taskCarriage['rigbtImage'] = '';
        taskCarriage['ptShow'] = false;

    }

    const onHandleRowClick = async (taskId, task_path) => {
        console.log("history table row is clicked ", taskId, task_path)
        if (from === 'kairos') {
            taskCarriage['task_id'] = taskId;
            taskCarriage['task_path'] = task_path;
            taskCarriage['requestUnityTable'] = true;
        }
    }
    const getTasks = async () => {
        let response = null;
        try {
            response = await axios.get(process.env.REACT_APP_SERVER_URL + `/control/gettask`);
        }
        catch (err) {
            console.log(err)
        }

        if (response && response.data.task_array) {
            console.log('gettasks response', response.data.task_array);
            setTasks(response.data.task_array)
            setTasksLoaded(true)
            taskCarriage['task'] = response.data.task_array;
            taskCarriage['task_loaded'] = true;
        }
    }


    const TaskHistoryRecords = async () => {
        return (
            tasks.map((task =>
                <tr key={task.task_no} onClick={() => onHandleRowClick(task.task_id, task.task_path)} >
                    <td> {task.task_no}</td>
                    <td> {task.task_id}</td>
                    <td>{task.createdate}</td>
                    <td>{task.alias}</td>
                    <td align='left'><Button size='sm'
                        as='input'
                        type='button'
                        variant='warning'
                        value='History'
                        onClick={() => onHandleHistoryClick(task.task_id)}
                        style={{ width: '75px' }}
                        hidden={parseInt(task.count) === 0 || from === 'kairos'}>
                    </Button>{' '}
                        <Button size='sm'
                            as='input'
                            type='button'
                            value='Request'
                            onClick={() => onHandleRequestClick(task.task_id, task.task_path)}
                            style={{ width: '75px' }}
                            hidden={from === 'kairos'}>
                        </Button>{' '}
                    </td>
                </tr >
            ))
        )
    }
    if (tasksLoaded === true) {

        return (
            <>
                <div className='table-container1'>
                    <p id="task-title" ><img src='./asset/pin.png' width="20px" alt="" />  TASK LIST : {daterange}</p>
                    <Table id="table-body" striped bordered variant="dark">
                        <thead>
                            <tr>
                                <th id="th-no">Task No</th>
                                <th id="th-id">Task ID</th>
                                <th id="th-date">Create Date</th>
                                <th id="th-alias">Description</th>
                                <th id="th-request">Request</th>
                            </tr>
                        </thead>
                        <tbody>
                            <TaskHistoryRecords />
                        </tbody>
                    </Table>
                </div>
            </>
        );
    } else {
        return (
            <></>
        )
    }
};
 */

export const TaskRequestHistory = ({ from, callback }) => {

    const { common, changeCommon } = useContext(commonData)
    const { configure, changeConfigure } = useContext(configData)

    const taskId = common.selectedTaskId;
    const taskPath = common.selectedTaskPath;
    console.log("task library from : ", from, taskId)

    const [requestTaskIdMessage, setRequestTaskIdMessage] = useState('')
    const [requestHistoryLoaded, setRequestHistoryLoaded] = useState(false)

    const [downloadInfo, setDownloadInfo] = useState({ url: '', name: '' });

    const [requestHistory, setRequestHistory] = useState('')
    const [checkedList, setCheckedList] = useState([])
    const [modalshow, setModalShow] = useState(false)

    const changeHandle = (type, param) => {
        console.log('change handle is called', type, param)
        if (type === 'init') {
            console.log('init param ..', param)

        } else if (type === 'addgenid') {
            console.log('addgen id ', param)
            // setLeftImage('')
            // setRightImage('')

        } else if (type === 'changegenmsg') {
            console.log('no use.. chagne gen mesage..');
        } else if (type === 'modalclose') {
            console.log('notification closing ');
            setModalShow(false)
        }
    }

    const getRequestHistory = async (taskId) => {
        console.log("getRequestHistory is started : ", taskId);
        let response = null;

        try {
            response = await axios.get(process.env.REACT_APP_SERVER_URL + `/control/getrequest/${taskId}`);
        } catch (err) {
            console.log(err);
            const strmsg = `${taskId}, No request.`
            setRequestTaskIdMessage(strmsg)
            setRequestHistoryLoaded(false)

        }

        if (response && response.data.request_array) {
            if (response.data.request_array.length > 0) {
                setRequestHistory(response.data.request_array)
                setRequestHistoryLoaded(true)

                const count = response.data.request_array.length
                const strmsg = `${taskId}, ${count} request.`
                setRequestTaskIdMessage(strmsg)
            } else {
                const strmsg = `${taskId}, No request.`
                setRequestTaskIdMessage(strmsg)
                setRequestHistoryLoaded(true)

            }
        }
    }

    useEffect(() => {
    }, [requestHistoryLoaded])

    if (requestHistoryLoaded === false && taskId !== '') {
        getRequestHistory(taskId)
    }

    const RequstHistoryTable = () => {

        const onHandlePairClick = async (category, taskId, groupId, jobId) => {
            console.log("onHandleGetPairClick ", category, taskId, groupId, jobId, configure.pair)
            let response = null;
            // setPtShow(false)

            if (category === 'CALCULATE') {
                try {
                    response = await axios.get(process.env.REACT_APP_SERVER_URL + `/api/image/${jobId}/${configure.pair}`);
                } catch (err) {
                    console.log(err);
                    return;
                }

                const imageUrl = process.env.REACT_APP_SERVER_IMAGE_URL + '/' + taskId + '/';

                if (response && response.data.status === 0) {
                    const imageUrlFirst = imageUrl + response.data.first_image;
                    const imageUrlSecond = imageUrl + response.data.second_image;
                    console.log(imageUrlFirst)
                    console.log(imageUrlSecond)
                    // setLeftImage(imageUrlFirst);
                    // setRightImage(imageUrlSecond);
                    // setCanvasJob([jobId, taskId, groupId])
                    changeCommon({ leftCanvasImage: imageUrlFirst })
                    changeCommon({ rightCanvasImage: imageUrlSecond })
                    changeCommon({ selectedJobId: jobId })
                    changeCommon({ selectedGroupId: groupId })
                    callback('change_step3')
                } else {
                    return;
                }
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

        const onHandleReviewClick = (taskId, requestId) => {
            console.log('onHandleReviewClick . ', requestId, modalshow)
            changeCommon({ selectedTaskId: taskId })
            changeCommon({ selectedRequestId: requestId })
            callback('change_step3_review')
            // setReviewJob([taskId, requestId])
            // setModalShow(true)
            // setPtShow(false)
        }

        const onHandleRowClick = (category, request_id, group_id, task_id, job_id) => {
            console.log("onHandle Genclick ", category, request_id, configure.labatory, group_id, task_id, job_id)
            if (category === 'GENERATE' && configure.labatory === 'true') {
                // setPtRequestId([request_id, group_id, task_id, job_id])
                // setPtShow(true)
            }
        }

        if (requestHistoryLoaded === true && requestHistory.length > 0) {
            return (
                requestHistory.map((req =>
                    <tr key={req.request_id} onClick={() => onHandleRowClick(req.request_category, req.request_id, req.group_id, req.task_id, req.job_id)}>
                        <td> {req.request_id}</td>
                        <td> {req.request_category}</td>
                        <td> {req.group_id}</td>
                        <td>{req.createdate}</td>
                        <td>{req.job_status}</td>
                        <td>{req.job_result}</td>
                        <td>{req.job_message}</td>
                        <td hidden={req.request_category !== 'CALCULATE'}>
                            <Button size="sm"
                                as="input"
                                type='button'
                                value='Pair'
                                onClick={() => onHandlePairClick(req.request_category, req.task_id, req.group_id, req.job_id)}
                                style={{ width: '80px' }}
                                disabled={req.job_status !== 100 || req.job_result < 0}
                            >
                            </Button>
                        </td>
                        <td hidden={req.request_category !== 'GENERATE'}>
                            <div id='request-history-gendiv'>
                                <Button id='gen-result-reivew'
                                    size='sm'
                                    // as="input"
                                    variant="primary"
                                    type="button"
                                    onClick={() => onHandleReviewClick(req.task_id, req.request_id)}
                                    disabled={parseInt(req.job_status) !== 100 || parseInt(req.job_result) !== (100)}  >
                                    <img src='./asset/play.png' width='20px' />
                                </Button> &nbsp;&nbsp;
                                {/* <Form.Check */}
                                <InputGroup.Checkbox
                                    id='gen-result-check'
                                    type='Checkbox'
                                    onChange={(e) => onCheckedElement(e.target.checked, req.request_id)}
                                    checked={checkedList.includes(req.request_id) ? true : false} />
                            </div>
                        </td>
                    </tr >
                ))
            );
        }
        else {
            return (
                <></>
            )
        }
    }

    const downloadResult = async () => {
        console.log('download result click checked in task_library : ', checkedList)
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
            console.log(response.data.filename)
            const _url = process.env.REACT_APP_SERVER_PTS_URL + response.data.filename;
            setDownloadInfo({ url: _url, name: response.data.filename });
            // saveAs(downloadInfo.url, downloadInfo.name);
            console.log('download url ', _url)
        }
    }

    useEffect(() => {
        if (downloadInfo.url !== '' && downloadInfo.name !== '') {
            saveAs(downloadInfo.url, downloadInfo.name);
        }
    }, [downloadInfo])



    return (
        <>
            <p id="task-title2" hidden={!requestHistoryLoaded}>
                <img src='./asset/pin.png' width="20px" alt="" />  TASK ID: {requestTaskIdMessage} {'  '}
                <img src='./asset/refresh.png' width="20px" alt="" onClick={() => getRequestHistory(taskId)} /> </p>
            <div className='table-container2' hidden={!requestHistoryLoaded}>
                <Table id="table-body" striped bordered variant="dark" >
                    <thead>
                        <tr>
                            <th>Request Id</th>
                            <th>Category</th>
                            <th>Group Id</th>
                            <th>Create Date</th>
                            <th>Status</th>
                            <th>Result</th>
                            <th>Message</th>
                            <th>Try</th>
                        </tr>
                    </thead>
                    <tbody>
                        <RequstHistoryTable ></RequstHistoryTable>
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
                        hidden={requestHistory.length <= 1}
                        disabled={checkedList.length === 0}>
                    </Button>
                </div>
            </div>

        </>
    )
}

export default TaskRequestHistory;