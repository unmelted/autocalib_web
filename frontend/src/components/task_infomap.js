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
    const [ipvalue, setIpValue] = useState('');

    const ipRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;

    console.log("Task Info map ", taskId, selectedList);

    const initMapData = () => {
        const newMap = [];
        selectedList.forEach((cam) => {
            newMap[cam] = {
                stream_ip: '',
                tracker_ip: '',
                tracker_status: 'none',
                message: '',
            };
        })
        console.log("initMapdata : ", newMap);

        setInfoMap(newMap);
    }

    const onHandleApplyClick = (camera) => {
        console.log("handleApply ", camera, infoMap[camera])
    }

    const handleIpChange = (event, camera) => {
        console.log('handleIpChange : ', event, camera);

    }

    const onHandleRunClick = (camera) => {
        console.log("handleRun ", camera, infoMap[camera])
    }

    const onApplyAllClick = () => {

    }

    const onRunAllClick = () => {

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
                        <IPut onChange={(event) => { handleIpChange(event, cam, 'stream') }} />
                    </td>
                    <td>
                        <img src='./asset/arrow-circle.png' width="18px" alt=""
                            onClick={() => onHandleApplyClick(cam)} hidden={from === 'play'} className="image-effect" />
                    </td>
                    <td>
                        <img src='./asset/bullet_g.png' width="18px" alt="" />
                    </td>
                    <td> message
                    </td>
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
                <Table id="table-body" striped bordered variant="dark">
                    <thead>
                        <tr>
                            <th id="th-no">NO</th>
                            <th id="th-camera">CAMERA</th>
                            <th id="th-ip">TRACKER URL</th>
                            <th id="th-ip">STREAM URL</th>
                            <th id="th-apply">APPLY</th>
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
                            variant="primary"
                            id='submit'
                            as="input"
                            type='button'
                            value="Run All"
                            onClick={onRunAllClick}
                            style={{ float: 'right', width: '120px', marginRight: '90px' }}
                        >
                        </Button>
                        <Button
                            size="sm"
                            variant="primary"
                            id='submit'
                            as="input"
                            type='button'
                            value="Apply All"
                            onClick={onApplyAllClick}
                            style={{ float: 'right', width: '120px', marginRight: '20px' }}
                        >
                        </Button>

                    </Col>
                </Row>
            </div>
        </>
    )
};
