import React, { useState, useEffect, Fragment, useContext } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup';
import Table from 'react-bootstrap/Table';
import '../css/task_library.css';
import { PairCanvas } from './canvas.js'
// import { TableDataContext } from './auto_calib.js';


export const TaskLibrary = (props) => {

    const [tasks, setTasks] = useState('')
    const [loaded, setLoaded] = useState(false)
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

    const TaskRowRequest = async ({ taskId }) => {



        return (
            <></>
            //     <Button size="sm"
            //         as="input"
            //         type='button'
            //         value=" ... "
            //         onClick={onHandleRequestClick}>
            //     </Button>
        )
    }

    const TaskHistoryTable = ({ tasks }) => {
        const onHandleRequestClick = async ({ taskId }) => {
            console.log("onHandleRequest buttoin click", taskId);
            let response = null;

            try {
                response = await axios.get(process.env.REACT_APP_SERVER_URL + `/control/getrequest/${taskId}`);
            } catch (err) {
                console.log(err);
                return
            }

        }

        if (loaded == false) {
            return (
                <></>
            )
        }
        else {
            return (
                tasks.map((task =>
                    <tr key={task.task_no} >
                        <td> {task.task_no}</td>
                        <td> {task.task_id}</td>
                        <td>{task.createdate}</td>
                        <td>''</td>
                        <td><Button size="sm"
                            as="input"
                            type='button'
                            value=" ... "
                            onClick={() => onHandleRequestClick(task.task_id)}>
                        </Button>
                        </td>
                    </tr >
                )
                ));
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
            <p id="task-title" > Task Lists : {daterange}</p>
            <div className='table-container'>
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
                    <tbody id="table-dbody">
                        <TaskHistoryTable tasks={tasks} hidden={!loaded}></TaskHistoryTable>
                    </tbody>
                </Table>
            </div>
            <div>>
                <Table trsipped boardered variant="dark" >

                </Table>
            </div>
            <div className='canvas-containe'>
                <Canvas></Canvas>
            </div>
        </>
    )
}

export default TaskLibrary;