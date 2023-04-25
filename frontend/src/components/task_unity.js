import React, { useState, Fragment, useEffect, useContext } from 'react';
import axios from 'axios';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button'
import { ImageList, ImageListItem, ImageListItemBar } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import '../css/task_unity.css';

import { commonData } from '../App';
let itemData = [];

export const TaskUnityTable = ({ from, callback }) => {
    const { common, changeCommon } = useContext(commonData)

    const [taskId, setTaskId] = useState(common.selectedTaskId);
    const [tableLoad, setTableLoad] = useState(false);
    const imageUrl = process.env.REACT_APP_SERVER_IMAGE_URL + '/' + taskId + '/';
    const [selectList, setSelectList] = useState([]);
    const [message, setMessage] = useState("0 Camera selected ");

    console.log("Task Unity Table ", taskId, from, imageUrl);

    const getTaskData = async (taskId) => {
        console.log('start getTaskData : ', taskId)

        let response = null;
        try {
            response = await axios.get(process.env.REACT_APP_SERVER_URL + `/control/gettaskimages/${taskId}`);
        } catch (err) {
            console.log(err);
            itemData = [];

            return
        }

        if (response && response.data.request_array) {
            console.log('response.data : ', response.data.request_array);
            itemData = response.data.request_array;
            for (var i = 0; i < itemData.length; i++) {
                itemData[i].img = imageUrl + itemData[i].img;
            }

            setTableLoad(true);
        }
    }

    const onHandleImageClick = (name) => {
        console.log("onHandleRowClick : ", name);

        if (selectList.includes(name)) {
            setSelectList(selectList.filter((item) => item !== name))
        } else {
            setSelectList([...selectList, name]);
        }

    }

    const onSelectDoneClick = () => {
        changeCommon('selectedTaskImages', selectList);
        callback('change_step3')
    }

    useEffect(() => {

    }, [common.selectedTaskId]);

    useEffect(() => {
        console.log(selectList);
        setMessage(selectList.length + " Camera selected");
    }, [selectList]);

    if (tableLoad === false) {
        getTaskData(taskId);
    }

    if (tableLoad === false) {
        return (<></>)
    }
    else {

        return (
            <>
                <div>
                    <div className='messagebox-wrapper'>
                        <p id='task-title'>
                            <img src='./asset/pin.png' width="20px" alt="" />  Task ID : {taskId} / Total {itemData.length} cameras. </p>
                    </div>
                    <ImageList sx={{ width: '95%' }} cols={5} rowHeight={240} style={{ marginTop: '20px ' }}>
                        {itemData.map((item) => (
                            <ImageListItem key={item.name} onClick={() => onHandleImageClick(item.name)}>
                                <img
                                    src={`${item.img}?w=240&fit=crop&auto=format`}
                                    srcSet={`${item.img}?w=240&fit=crop&auto=format&dpr=2 2x`}
                                    alt={item.name}
                                    loading="lazy"
                                />
                                <ImageListItemBar
                                    title={item.name}
                                    subtitle={<span>{item.group}</span>}
                                    actionIcon={
                                        selectList.includes(item.name) && (
                                            <CheckCircleIcon fontSize='large' />)}
                                />
                            </ImageListItem>
                        ))}
                    </ImageList>
                </div>
                <div className='messagebox-wrapper'>
                    <Row>
                        <Col></Col>
                        <Col md='auto'>
                            <p>{message}</p></Col>
                        <Col xs lg="2">
                            <Button
                                size="sm"
                                variant="primary"
                                className="item-btn-wrapper"
                                id='submit'
                                as="input"
                                type='button'
                                value="Done"
                                onClick={onSelectDoneClick}
                                style={{ float: 'right', width: '120px', marginRight: '10px' }}
                            >
                            </Button>
                        </Col>
                    </Row>
                </div>
            </>
        )
    };
};


