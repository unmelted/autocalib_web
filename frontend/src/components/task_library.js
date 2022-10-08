import React, { useState, useEffect, Fragment, useContext } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup';
import Table from 'react-bootstrap/Table';
import '../css/task_library.css';
import { PairCanvas } from './canvas.js'
import pin from '../asset/pin.png';
// import { TableDataContext } from './auto_calib.js';


export const TaskLibrary = (props) => {

    const [tasks, setTasks] = useState('')
    const [loaded, setLoaded] = useState(false)
    const [requestTaskIdMessage, setRequestTaskIdMessage] = useState('')
    const [requestloaded, setRequestLoaded] = useState(false)
    const [requestHistory, setRequestHistory] = useState('')
    const [leftImage, setLeftImage] = useState('');
    const [rightImage, setRightImage] = useState('');
    const [canvasJob, setCanvasJob] = useState('')

    const Canvas = () => {
        if (rightImage !== '' && leftImage !== '') {
            console.log("Canvas is called 1 : " + rightImage)
            console.log("Canvas is called 2 : " + canvasJob)
            return (
                <>
                    <PairCanvas leftImage={leftImage} rightImage={rightImage} jobId={canvasJob[0]} taskId={canvasJob[1]} groupId={canvasJob[2]}></PairCanvas>
                </>)

        }
        else {
            return <></>
        }

    }

    const RequstHistoryTable = () => {
        const onHandleGetPairClick = async (taskId, groupId, jobId) => {
            console.log("onHandleGetPairClick ", taskId, groupId, jobId)
            let response = null;

            try {
                response = await axios.get(process.env.REACT_APP_SERVER_URL + `/api/image/${jobId}`);
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

        if (requestloaded == true) {
            return (
                requestHistory.map((req =>
                    <tr key={req.request_id} >
                        <td> {req.request_id}</td>
                        <td> {req.request_category}</td>
                        <td> {req.group_id}</td>
                        <td>{req.createdate}</td>
                        <td>{req.job_status}</td>
                        <td>{req.job_result}</td>
                        <td>{req.job_message}</td>
                        <td><Button size="sm"
                            as="input"
                            type='button'
                            value={req.request_category === 'CALCULATE' ? 'Pair' : 'Result'}
                            onClick={() => onHandleGetPairClick(req.task_id, req.group_id, req.job_id)}
                            style={{ width: '65px' }}
                            disabled={req.job_status !== 100 || req.job_result < 0}>
                        </Button></td>
                    </tr >
                )
                ));
        }
        else {
            return (
                <></>
            )
        }
    }

    const TaskHistoryTable = ({ tasks }) => {
        const onHandleRequestClick = async (taskId) => {
            console.log("onHandleRequest buttoin click", taskId);
            let response = null;

            try {
                response = await axios.get(process.env.REACT_APP_SERVER_URL + `/control/getrequest/${taskId}`);
            } catch (err) {
                console.log(err);
                const strmsg = `${taskId}, No request.`
                setRequestTaskIdMessage(strmsg)
                setRequestLoaded(false)

                return
            }

            if (response && response.data.request_array) {
                setRequestHistory(response.data.request_array)
                setRequestLoaded(true)
                const count = response.data.request_array.length
                const strmsg = `${taskId}, ${count} request.`
                setRequestTaskIdMessage(strmsg)

            }
        }

        if (loaded == true) {
            return (
                tasks.map((task =>
                    <tr key={task.task_no} >
                        <td> {task.task_no}</td>
                        <td> {task.task_id}</td>
                        <td>{task.createdate}</td>
                        <td>{task.alias}</td>
                        <td><Button size="sm"
                            as="input"
                            type='button'
                            value=" .. "
                            onClick={() => onHandleRequestClick(task.task_id)}>
                        </Button>
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
            console.log("send gettasks");
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
            <p id="task-title" ><img src={pin} width="20px" alt="" /> Task Lists : {daterange}</p>
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
            <div className='table-container2' hidden={!requestloaded}>
                <p id="task-title"><img src={pin} width="20px" alt="" /> Task ID : {requestTaskIdMessage}</p>
                <Table trsipped boardered variant="dark" >
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
            </div>
            <div className='canvas-container'>
                <Canvas></Canvas>
            </div>
        </>
    )
}

export default TaskLibrary;