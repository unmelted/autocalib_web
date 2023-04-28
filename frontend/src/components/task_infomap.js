import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button'
import Table from 'react-bootstrap/Table';
import IPut from 'iput';

import '../css/task_unity.css';

import { commonData } from '../App';

//from : create or play in kairos
export const TaskInfoMap = ({ from, callback }) => {
    const { common, changeCommon } = useContext(commonData)
    const [taskId, setTaskId] = useState(common.selectedTaskId);
    const [selectedList, setSelectedList] = useState(common.selectedTaskImages);
    const [infoMap, setInfoMap] = useState([]);
    const [message, setMessage] = useState('');


    const ipRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;

    console.log("Task Info map ", taskId, selectedList);

    const initMapData = () => {
        const newMap = [];
        selectedList.forEach((cam) => {
            newMap[cam] = {
                stream_url: '',
                tracker_url: '',
                tracker_status: 'none',
                message: '',
            };
        })
        console.log("initMapdata : ", newMap);

        setInfoMap(newMap);
    }

    const updateInfoMap = async () => {
        console.log('start updateInfoMap ');

        const data = {
            task_id: taskId,
            info_map: infoMap,
        }

        let response = null;
        try {
            response = await axios.post(process.env.REACT_APP_SERVER_URL + `/control/updatetracker`, data);
        } catch (err) {
            console.log(err);
            return
        }

        if (response) {
            console.log('response.data : ', response.data);
        }
    }

    const onHandleApplyClick = async (camera) => {
        console.log("handleApply ", camera, infoMap[camera])
        await updateInfoMap();

    }

    const handleIpChange = (event, camera, type) => {
        console.log('handleIpChange : ', event, camera, type);

        if (type === ' tracker') {
            infoMap[camera].tracker_url = event;
        }
        else if (type === 'stream') {
            infoMap[camera].stream_url = event;
        }

    }

    const onHandleRunClick = (camera) => {
        console.log("handleRun ", camera, infoMap[camera])
    }

    const onApplyAllClick = () => {

    }

    const onRunAllClick = () => {

    }

    const onGetStreamClick = () => {

    }

    useEffect(() => {

        initMapData();

    }, []);

    const InfoMapTable = () => {
        return (
            selectedList.map((cam, index) =>
                <tr key={cam} >
                    <td>{index + 1}</td>
                    <td>{cam}</td>
                    <td>
                        <IPut onChange={(event) => { handleIpChange(event, cam, 'tracker') }} />
                    </td>
                    <td>
                        {/* <IPut onChange={(event) => { handleIpChange(event, cam, 'stream') }} /> */}
                        <Form.Control type="text" size="sm" style={{ padding: '2px' }} onChange={(event) => { handleIpChange(event, cam, 'stream') }} />
                    </td>
                    <td>
                        <img src='./asset/arrow-circle.png' width="18px" alt=""
                            onClick={() => onHandleApplyClick(cam)} hidden={from === 'play'} className="image-effect" />
                    </td>
                    <td>
                        <img src='./asset/bullet_g.png' width="18px" alt="" />
                    </td>
                    <td> {message} </td>
                    <td>
                        <img src='./asset/play-circle.png' width="18px" alt=""
                            onClick={() => onHandleRunClick(cam)} hidden={from === 'play'} className="image-effect" />
                    </td>
                </tr>
            ))
    }


    return (
        <>
            <div className='table-container'>
                <div className='messagebox-wrapper-map'>
                    <Row>
                        <Col md='auto'>
                            <span id='task-title' style={{ marginBottom: '10px' }}>
                                <img src='./asset/checkbox.png' width="20px" alt="" />  Task ID : {taskId} </span>
                        </Col>
                        <Col md='auto'></Col>
                        <Col md lg='2' className="d-flex justify-content-start align-items-center">
                            <Button
                                size="md"
                                variant="primary"
                                id='submit'
                                as="input"
                                type='button'
                                value="Get Stream URL"
                                onClick={onGetStreamClick}
                                style={{ float: 'right', width: '160px', marginRight: '10px' }}
                            >
                            </Button>
                        </Col>
                        <Col md lg='2' className="d-flex justify-content-start align-items-center" >
                            <Form.Control size="sm" type="text" placeholder="url.." disabled readOnly /> </Col>
                    </Row>
                </div>
                <Table id="table-body" striped bordered variant="dark" >
                    <thead>
                        <tr>
                            <th id="th-no">NO</th>
                            <th id="th-camera">CAMERA</th>
                            <th id="th-ip">TRACKER URL</th>
                            <th id="th-ip">STREAM URL</th>
                            <th id="th-apply">PING</th>
                            <th id="th-status">STATUS</th>
                            <th id="th-msg">MESSAGE</th>
                            <th id="th-run">RUN</th>
                        </tr>
                    </thead>
                    <tbody>
                        <InfoMapTable />
                    </tbody>
                </Table>
            </div>
            <div >
                <Row>
                    <Col></Col>
                    <Col md='auto'>
                        <p>{message}</p></Col>
                    <Col xs lg="6">
                        <Button
                            size="sm"
                            variant="danger"
                            id='submit'
                            as="input"
                            type='button'
                            value="Run All"
                            onClick={onRunAllClick}
                            style={{ float: 'right', width: '120px', marginRight: '60px' }}
                        >
                        </Button>

                        <Button
                            size="sm"
                            variant="primary"
                            id='submit'
                            as="input"
                            type='button'
                            value="Apply All"
                            onClick={onRunAllClick}
                            style={{ float: 'right', width: '120px', marginRight: '20px' }}
                        >
                        </Button>
                    </Col>
                </Row>
            </div>
        </>
    )
};
