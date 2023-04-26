import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup';
import Table from 'react-bootstrap/Table';

import '../css/task_unity.css';

import { commonData } from '../App';

//from : create or play in kairos
export const TaskInfoMap = ({ from, callback }) => {
    const { common, changeCommon } = useContext(commonData)
    const [taskId, setTaskId] = useState(common.selectedTaskId);
    const [selectedList, setSelectedList] = useState(common.selectedTaskImages);
    const [infoMap, setInfoMap] = useState([]);

    const inputRefs = useRef([{}]);

    const ipRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;

    console.log("Task Info map ", taskId, selectedList);

    const initMapData = () => {
        const newMap = [];
        selectedList.forEach((cam) => {
            newMap[cam] = {
                stream_ip: '',
                tracker_ip: '',
                tracker_status: 'none'
            };
        })
        console.log("initMapdata : ", newMap);

        setInfoMap(newMap);
    }

    const onHandleApplyClick = (camera) => {
        console.log("handleApply ", camera, infoMap[camera])
    }

    const handleIpChange = (event, camera, index) => {
        const newip = event.target.value;

        setInfoMap((prevInfoMap) => {
            const newInfoMap = [...prevInfoMap];
            newInfoMap[camera] = newip;
            return newInfoMap;
        });
        if (inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
    }

    const onHandleRunClick = (camera) => {
        console.log("handleRun ", camera, infoMap[camera])
    }

    const renderInput = (camera, index) => {
        return (
            <input
                type="text"
                value={infoMap[camera]}
                pattern={ipRegex}
                ref={(input) => (inputRefs.current[index] = input)} />
        )
    }

    useEffect(() => {

    }, []);

    if (infoMap.length === 0) {
        // initMapData();
    }

    const InfoMapTable = () => {
        return (
            selectedList.map((cam, index) =>
                <tr key={cam} >
                    <td>{index + 1}</td>
                    <td>{cam}</td>
                    <td> TEST
                        {/* <form>
                            <label> IP : {' '}
                                <input
                                    type="text"
                                    // value={infoMap[cam]}
                                    pattern={ipRegex} />
                            </label>
                        </form> */}
                    </td>
                    <td> TEST
                        {/* <form>
                            <label> IP : {' '}
                                <input
                                    type="text"
                                    // value= {infoMap[cam]}
                                    pattern={ipRegex} />
                            </label>
                        </form> */}
                    </td>
                    <td><Button size='sm'
                        as='input'
                        type='button'
                        variant='primary'
                        onClick={() => onHandleApplyClick(cam)}
                        style={{ width: '40px' }}
                        hidden={from === 'play'}>
                        <img src='.asset/arrow-circle.png' width="20px" alt="" />.
                    </Button></td>
                    <td>
                        {/* <img src='./asset/bullet_b.png' width="20px" alt="" /> */}
                        test
                    </td>
                    <td><Button size='sm'
                        as='input'
                        type='button'
                        variant='primary'
                        value='START'
                        onClick={() => onHandleRunClick(cam)}
                        style={{ width: '40px' }}
                        hidden={from === 'play'}>
                        {/* <img src='.asset/play-circle.png' width="20px" alt="" /> */}
                    </Button></td>
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
                            <th id="th-run">RUN</th>
                        </tr>
                    </thead>
                    <tbody>
                        <InfoMapTable />
                    </tbody>
                </Table>
            </div>
        </>
    )
};
