import React, { useState, Fragment, useEffect, useContext } from 'react';
import axios from 'axios';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';


let itemData = [];

export const TaskUnityTable = ({ taskId, taskPath, from }) => {
    const [tableLoad, setTableLoad] = useState(false);
    const imageUrl = process.env.REACT_APP_SERVER_IMAGE_URL + '/' + taskId + '/';
    console.log("Task Unity Table ", taskId, taskPath, from, imageUrl);

    const getTaskData = async (taskId, taskPath) => {
        console.log('start getTaskData : ', taskId, taskPath)
        console.log(taskId)
        console.log(taskPath)

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
                console.log('itemData[i].img : ', itemData[i].img);
            }

            setTableLoad(true);
        }
    }

    const onHandleRowClick = (name) => {
        console.log('onHandleRowClick : ', name);
    }

    useEffect(() => {

    }, [tableLoad]);

    getTaskData(taskId, taskPath);

    if (tableLoad === false) {
        return (<div />)
    }
    else {
        console.log("table loaded true .... ");

        return (
            <>
                <div>
                    <ImageList sx={{ width: '95%' }} cols={5} rowHeight={240}>
                        {itemData.map((item) => (
                            <ImageListItem key={item.name} onClick={() => onHandleRowClick(item.name)}>
                                <img
                                    src={`${item.img}?w=240&fit=crop&auto=format`}
                                    srcSet={`${item.img}?w=240&fit=crop&auto=format&dpr=2 2x`}
                                    alt={item.name}
                                    loading="lazy"
                                />
                                <ImageListItemBar
                                    title={item.name}
                                    subtitle={<span>{item.group}</span>}
                                    position="below"
                                />
                            </ImageListItem>
                        ))}
                    </ImageList>
                </div>

            </>
        )
    };
};


