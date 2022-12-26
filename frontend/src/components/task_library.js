import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import Button from 'react-bootstrap/Button'
import { Form } from 'react-bootstrap'
import InputGroup from 'react-bootstrap/InputGroup';
import Table from 'react-bootstrap/Table';
import { configData } from '../App.js'
import '../css/task_library.css';

import { TaskGroupTable } from './task.js'
import { PairCanvas } from './canvas.js'
import { ReviewGallery } from './gallery.js';
import { PositionTracking } from './position_tracking.js';


export const TaskLibrary = (props) => {
    const { configure, changeConfigure } = useContext(configData)
    const [tasks, setTasks] = useState('');
    const [loaded, setLoaded] = useState(false);

    const [taskId, setTaskId] = useState('');
    const [taskPath, setTaskPath] = useState('');
    const [requestTaskIdMessage, setRequestTaskIdMessage] = useState('')
    const [requestHistoryloaded, setRequestHistoryLoaded] = useState(false)
    const [requestGrouploaded, setRequestGroupLoaded] = useState(false)
    const [downloadInfo, setDownloadInfo] = useState({ url: '', name: '' });

    const [requestHistory, setRequestHistory] = useState('')
    const [requestGroup, setRequestGroup] = useState('')
    const [leftImage, setLeftImage] = useState('');
    const [rightImage, setRightImage] = useState('');
    const [canvasJob, setCanvasJob] = useState('')
    const [checkedList, setCheckedList] = useState([])
    const [modalshow, setModalShow] = useState(false)
    const [reviewJob, setReviewJob] = useState('')
    const [ptshow, setPtShow] = useState(false)
    const [ptRequestId, setPtRequestId] = useState(0)

    const changeHandle = (type, param) => {
        console.log('change handle is called', type, param)
        if (type === 'init') {
            console.log('init param ..', param)

        } else if (type === 'addgenid') {
            console.log('addgen id ', param)
            setLeftImage('')
            setRightImage('')

        } else if (type === 'changegenmsg') {
            console.log('no use.. chagne gen mesage..');
        } else if (type === 'modalclose') {
            console.log('notification closing ');
            setModalShow(false)
        }
    }

    const Canvas = () => {
        if (rightImage !== '' && leftImage !== '') {
            console.log("Canvas is called 1 : " + rightImage)
            console.log("Canvas is called 2 : " + canvasJob)
            return (
                <>
                    <PairCanvas leftImage={leftImage} rightImage={rightImage} jobId={canvasJob[0]} taskId={canvasJob[1]} groupId={canvasJob[2]} changeHandle={changeHandle}></PairCanvas>
                </>)

        }
        else {
            return <></>
        }
    }
    const ReviewModal = () => {
        console.log('review modal .. : ', modalshow)
        if (modalshow === true) {
            return (
                <>
                    <ReviewGallery taskId={reviewJob[0]} requestId={reviewJob[1]} changeHandle={changeHandle} ></ReviewGallery>
                </>
            )
        }
        else {
            return <></>
        }
    }

    const ReviewStatistics = () => {
        console.log("Review Statistics", ptRequestId)
        if (ptshow === true && ptRequestId !== 0) {
            return (
                <>
                    <PositionTracking requestId={ptRequestId}></PositionTracking>
                </>
            )
        }
    }

    const getRequestHistory = async (taskId) => {
        console.log("onHandleRequest buttoin click", taskId);
        let response = null;

        try {
            response = await axios.get(process.env.REACT_APP_SERVER_URL + `/control/getrequest/${taskId}`);
        } catch (err) {
            console.log(err);
            const strmsg = `${taskId}, No request.`
            setRequestTaskIdMessage(strmsg)
            setRequestHistoryLoaded(false)

            return
        }

        if (response && response.data.request_array) {
            setRequestHistory(response.data.request_array)
            setRequestHistoryLoaded(true)
            setRequestGroupLoaded(false)
            const count = response.data.request_array.length
            const strmsg = `${taskId}, ${count} request.`
            setRequestTaskIdMessage(strmsg)
        }
    }

    const RequstHistoryTable = () => {

        const onHandlePairClick = async (category, taskId, groupId, jobId) => {
            console.log("onHandleGetPairClick ", category, taskId, groupId, jobId, configure.pair)
            let response = null;
            setPtShow(false)

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
                    setLeftImage(imageUrlFirst);
                    setRightImage(imageUrlSecond);
                    setCanvasJob([jobId, taskId, groupId])
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
            setReviewJob([taskId, requestId])
            setModalShow(true)
            setPtShow(false)
        }

        const onHandleRowClick = (category, request_id) => {
            console.log("onHandle Genclick ", category, request_id, configure.labatory)
            if (category === 'GENERATE' && configure.labatory === 'true') {
                setPtRequestId(request_id)
                setPtShow(true)
            }
        }

        if (requestHistoryloaded === true) {
            return (
                requestHistory.map((req =>
                    <tr key={req.request_id} onClick={() => onHandleRowClick(req.request_category, req.request_id)}>
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

    const TaskHistoryTable = ({ tasks }) => {
        const onHandleHistoryClick = async (taskId) => {
            console.log("onHandleRequest buttoin click", taskId);
            setCheckedList([])
            setTaskId(taskId);
            getRequestHistory(taskId);
            setLeftImage('')
            setRightImage('')
            setPtShow(false)
        }

        const onHandleRequestClick = async (taskId, task_path) => {
            console.log("onHandleRequestClck !! ")
            setCheckedList([])
            setTaskId(taskId);
            setTaskPath(task_path);
            setRequestGroupLoaded(true)
            setRequestHistoryLoaded(false)
            setLeftImage('')
            setRightImage('')
            setPtShow(false)
        }

        if (loaded === true) {
            return (
                tasks.map((task =>
                    <tr key={task.task_no} >
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
                            hidden={parseInt(task.count) === 0}>
                        </Button>{' '}
                            <Button size='sm'
                                as='input'
                                type='button'
                                value='Request'
                                onClick={() => onHandleRequestClick(task.task_id, task.task_path)}
                                style={{ width: '75px' }} >
                                {/* hidden={parseInt(task.count) > 0}> */}
                            </Button>{' '}
                        </td>
                    </tr >
                )
                ));
        } else {
            return (
                <></>
            )
        }
    };

    const getTasks = async () => {
        let response = null;
        try {
            console.log('send gettasks');
            response = await axios.get(process.env.REACT_APP_SERVER_URL + `/control/gettask`);
        }
        catch (err) {
            console.log(err)
        }

        if (response && response.data.task_array) {
            setTasks(response.data.task_array)
            setLoaded(true)
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

    const today = new Date();
    let fromdate = new Date()
    fromdate.setDate(today.getDate() - 7);
    const todate = today.toLocaleDateString();
    const daterange = fromdate.toLocaleDateString() + ' - ' + todate
    console.log(" library title ", daterange)

    useEffect(() => {
        getTasks();
    }, [])

    return (
        <>
            <p id="task-title" ><img src='./asset/pin.png' width="20px" alt="" />  Task Lists : {daterange}</p>
            <div className='table-container1'>
                <Table striped bordered variant="dark">
                    <thead>
                        <tr>
                            <th id="th-no">Task No</th>
                            <th id="th-id">Task ID</th>
                            <th id="th-date">Create Date</th>
                            <th id="th-alias">Description</th>
                            <th id="th-request">Request</th>
                        </tr>
                    </thead>
                    <tbody id="table-body">
                        <TaskHistoryTable tasks={tasks} hidden={!loaded}></TaskHistoryTable>
                    </tbody>
                </Table>
            </div>
            <p id="task-title2" hidden={!requestHistoryloaded}>
                <img src='./asset/pin.png' width="20px" alt="" />  Task ID : {requestTaskIdMessage} {'  '}
                <img src='./asset/refresh.png' width="20px" alt="" onClick={() => getRequestHistory(taskId)} /> </p>
            <div className='table-container2' hidden={!requestHistoryloaded}>
                <Table stripped boardered variant="dark" >
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
                    <tbody id="table-body">
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
            <div id='table-container3'
                hidden={requestGrouploaded === false}>
                <TaskGroupTable taskId={taskId} taskPath={taskPath} entry={'history'} />
            </div>
            <div>
                <Canvas />
            </div>
            <div hidden={ptshow === false}>
                <ReviewStatistics />
            </div>
            <div>
                <ReviewModal />
            </div>
        </>
    )
}

export default TaskLibrary;