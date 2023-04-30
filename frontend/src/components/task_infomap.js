import React, { useState, useRef, useEffect, useContext, Component } from 'react';
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
export const TaskInfoMap = ({ from, callback, initMap }) => {
    const { common, changeCommon } = useContext(commonData)
    const [taskId, setTaskId] = useState(common.selectedTaskId);
    const [trackerTaskId, setTrackerTaskId] = useState(common.trackerTaskId);
    const [selectedList, setSelectedList] = useState(common.selectedTaskImages);
    const [infoMap, setInfoMap] = useState(initMap);
    const [message, setMessage] = useState('');
    const bullet_img = { none: './asset/bullet_g.png', success: './asset/bullet_gr.png', fail: './asset/bullet_r.png' };

    const ipRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;

    console.log("Task Info map ", taskId, selectedList);
    console.log("task info map initMap : ", initMap);


    const updateInfoMap = async () => {


        const data = {
            tracker_task_id: common.trackerTaskId,
            info_map: infoMap,
        }
        console.log('start updateInfoMap ', data);

        let response = null;
        try {
            response = await axios.post(process.env.REACT_APP_SERVER_URL + "/control/updatetracker", data);
        } catch (err) {
            console.log(err);
            return
        }

        if (response) {
            console.log('response.data : ', response.data);
        }
    }

    const checkPing = async (camera) => {
        console.log('start checkPing : ', camera);

        const data = {
            tracker_ip: infoMap[camera].tracker_url
        }

        let response = null;
        try {
            response = await axios.post(process.env.REACT_APP_SERVER_URL + `/control/ping`, data);
        } catch (err) {
            console.log(err);
            return
        }

        if (response) {
            console.log('response.data : ', response.data);
            const newMap = { ...infoMap };
            if (response.data.status === 'success') {
                newMap[camera].tracker_status = 'success';
                newMap[camera].message = response.data.message;
            }
            else {
                newMap[camera].tracker_status = 'fail';
                newMap[camera].message = response.data.message;
            }
            setInfoMap(newMap);
        }
    }

    const onHandlePingClick = async (camera) => {
        console.log("handlePingClick ", camera, infoMap)
        checkPing(camera)

    }

    const onHandlePingAllClick = async () => {
        console.log("handleApplyAll click ", infoMap)

        for (let i = 0; i < Object.keys(infoMap).length; i++) {
            console.log("pingall i : ", i, infoMap[Object.keys(infoMap)[i]].tracker_url);
            checkPing(Object.keys(infoMap)[i]);
        }
    }

    const onHandleIpChange = (event, camera, type) => {
        console.log('handleIpChange : ', camera, type);
        const newMap = { ...infoMap };

        if (type === 'tracker') {
            console.log('tracker url : ', event);
            newMap[camera].tracker_url = event;
        }
        else if (type === 'stream') {
            newMap[camera].stream_url = event.target.value;
        }
        console.log('handleIpChange result : ', infoMap);
    }

    const onHandleRunClick = (camera) => {
        console.log("handleRun ", camera, infoMap[camera])
    }

    const onHandleReadyClick = async () => {
        await updateInfoMap();
        // setInfoMap(newMap);    
    }

    const onHandleRunAllClick = () => {

    }

    const onGetStreamClick = () => {

    }

    useEffect(() => {
        const onUnload = () => {
            window.scrollTo(0, 0);
        };

        window.addEventListener('beforeunload', onUnload);

        return () => {
            window.removeEventListener('beforeunload', onUnload);
        };

    }, []);
    // value={infoMap[cam].tracker_url}
    //value={infoMap[cam].stream_url}    

    const InfoMapTable = () => {
        return (
            selectedList.map((cam, index) =>
                <tr key={cam} >
                    <td>{index + 1}</td>
                    <td>{cam}</td>
                    <td>
                        <IPut onChange={(event) => { onHandleIpChange(event, cam, 'tracker') }}
                            defaultValue={infoMap[cam].tracker_url} />
                    </td>
                    <td>
                        {/* <IPut onChange={(event) => { handleIpChange(event, cam, 'stream') }} /> */}
                        <Form.Control type="text" size="sm" style={{ padding: '2px' }}
                            onChange={(event) => { onHandleIpChange(event, cam, 'stream') }}
                            defaultValue={infoMap[cam].stream_url} />
                    </td>
                    <td>
                        <img src='./asset/arrow-circle.png' width="18px" alt=""
                            onClick={() => onHandlePingClick(cam)} hidden={from === 'play'} className="image-effect" />
                    </td>
                    <td>
                        <img src={bullet_img[infoMap[cam].tracker_status]} width="18px" alt="" />
                    </td>
                    <td> {infoMap[cam].message} </td>
                    {/* <td> ... </td> */}
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
                            onClick={onHandleRunAllClick}
                            style={{ float: 'right', width: '120px', marginRight: '80px' }}
                        >
                        </Button>
                        <Button
                            size="sm"
                            variant="info"
                            id='submit'
                            as="input"
                            type='button'
                            value="Ready"
                            onClick={onHandleReadyClick}
                            style={{ float: 'right', width: '120px', marginRight: '20px' }}
                        >
                        </Button>

                        <Button
                            size="sm"
                            variant="primary"
                            id='submit'
                            as="input"
                            type='button'
                            value="Ping All"
                            onClick={onHandlePingAllClick}
                            style={{ float: 'right', width: '120px', marginRight: '20px' }}
                        >
                        </Button>
                    </Col>
                </Row>
            </div>
        </>
    )
};
