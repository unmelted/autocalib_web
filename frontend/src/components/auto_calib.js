import React, { useEffect, useState, createContext } from 'react';
import axios from 'axios';
import '../css/autocalib.css';
import ProgressBar from 'react-bootstrap/ProgressBar'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button'

import { getTotalFileSize, getFileExt, isValidFile, isValidImage, getGroupInfo } from './util.js'
import { TaskGroupTable } from './task.js'

export const TableDataContext = createContext();
const initial =
    [
        {
            "group_id": "Group1",
            "cam_count": 0,
            "no": 102,
            "status": "None",
            "job_id": 2067
        },
        {
            "group_id": "Group2",
            "cam_count": 0,
            "no": 103,
            "status": "None",
            "job_id": 2068
        }
    ]

function AutoCalib(props) {

    const [statusMessage, setStatusMessage] = useState("");
    const [isUploaded, setIsUploaded] = useState(false)

    const [percent, setPercent] = useState(0);
    const [taskId, setTaskId] = useState('');
    const [taskPath, setTaskPath] = useState('');
    const [groupInfo, setGroupInfo] = useState(initial);
    const [taskLoad, setTaskLoad] = useState(false);

    const uploadFiles = async (e) => {
        e.preventDefault();

        setPercent(0);
        setStatusMessage("");

        const totalFileSize = getTotalFileSize(e.target.files);

        let formData = new FormData();
        let imageCount = 0;

        for (const key of Object.keys(e.target.files)) {
            if (!isValidFile(e.target.files[key])) {
                setStatusMessage("Upload Failed! - Invalid file: " + e.target.files[key].name);
                return;
            }
            if (getFileExt(e.target.files[key]) === 'ds_store') {
                continue;
            }

            if (isValidImage(e.target.files[key])) {
                imageCount++;
            }

            formData.append('imgCollection', e.target.files[key])
        }

        if (imageCount < process.env.REACT_APP_MIN_UPLOAD_IMAGE_NUM) {
            setStatusMessage("Upload Failed! - At least 5 image files are required.");
            return;
        }

        const config = {
            header: { 'Context-Type': 'multipart/form-data' },
            onUploadProgress: progressEvent => {
                const curPercent = Math.round(progressEvent.loaded / totalFileSize * 100);
                setPercent(curPercent);
                setStatusMessage("Uploading...");
            }
        }

        let response = null;

        try {
            response = await axios.post(process.env.REACT_APP_SERVER_URL + "/file/upload", formData, config);
        } catch (err) {
            console.log(err);
            setPercent(0);
            setStatusMessage('Upload Failed!');
            return;
        }

        if (response && response.data && response.data.status === 0) {
            setIsUploaded(true);
            setStatusMessage("Upload Completed!");
            setTaskId(response.data.taskId);
            setTaskPath(response.data.taskPath);
        }
    }

    const reset = () => {
        window.location.reload();
    }

    // const removeCalcTimer = () => {
    //     clearInterval(calcProgressTimerRef.current);
    //     calcProgressTimerRef.current = null;
    // }

    // useEffect(() => {
    //     initContext();
    //     console.log(`isUplodaded : ${isUploaded}, isAllTarget : ${isAllTarget}, isSubmitted: ${isSubmitted}`)
    // }, [canvas]);

    const changeTableData = (groupNo, jobid) => {
        console.log(`changeTableData is called with ${groupNo}, ${jobid}`)

        for (const group of groupInfo) {
            if (group.no === groupNo) {
                group["job_id"] = jobid;
                console.log("changeTableData modify the jobid of group.. " + jobid)
            }
        }

        console.log(groupInfo);
    }

    useEffect(() => {

        async function getGroup() {
            if (taskId !== '') {
                console.log("task id useEffect ");
                try {
                    const group = await getGroupInfo(taskId);
                    for (const g of group) {
                        g["status"] = '';
                    }

                    setGroupInfo(group);
                    setTaskLoad(true)
                } catch (err) {
                    console.log("getGroup info error : ", err);
                }
            }
        }
        getGroup();
    }, [taskId]);

    // useEffect(() => {
    //     if (isUploaded && calculateState === CALC_STATE.START) {
    //         calcProgressTimerRef.current = setInterval(() => {
    //             axios.get(process.env.REACT_APP_SERVER_URL + `/api/calculate/status/${jobId}`)
    //                 .then(response => {
    //                     const percent = parseInt(response.data.percent);

    //                     if (percent === 100) {
    //                         removeCalcTimer();
    //                         setPercent(percent);
    //                         setCalculateState(CALC_STATE.COMPLETE);
    //                         setStatusMessage('Calculate Completed!');
    //                         getTwoImage();
    //                     } else {
    //                         setPercent(percent);
    //                     }
    //                 })ㄴ
    //                 .catch(err => {
    //                     console.log(err);
    //                     removeCalcTimer();
    //                 });
    //         }, 2000);
    //     } else if (calculateState === CALC_STATE.CANCEL) {
    //         removeCalcTimer();
    //         setStatusMessage('Calculate is cancled. Start another Task.');
    //     }
    //     return () => {
    //         removeCalcTimer();
    //     }
    // }, [calculateState]);

    // useEffect(() => {
    //     targetPointRef.current = {
    //         left: [],
    //         right: []
    //     };
    // }, []);

    return (
        <>
            <div className="form-group">
                <Form.Group className='item-wrapper'>
                    <Form.Control size="sm"
                        type='file'
                        id='files'
                        webkitdirectory={'webkitdirectory'}
                        mozdirectory={'mozdirectory'}
                        onChange={uploadFiles}
                        disabled={isUploaded}
                    />
                </Form.Group>
                <Form.Group className='item-wrapper'>
                    <ProgressBar size="sm"
                        id='progressbar'
                        now={percent}
                        label={`${percent}% completed`}
                    />
                </Form.Group>
                <Form.Group className='item-wrapper'>
                    <Form.Control size="sm"
                        id='upload-status'
                        type='text'
                        value={statusMessage}
                        readOnly={true}
                    />
                </Form.Group>
                {/* <div className="row"> */}
                <div>
                    <Form.Group className='item-btn-wrppter'>
                        <Button size="sm"
                            variant="primary"
                            className="item-btn-wrapper"
                            id='reset'
                            as="input"
                            type='button'
                            value="Reset"
                            onClick={reset}
                            style={{ float: 'left' }}
                            disabled={!isUploaded}
                        >
                        </Button>
                    </Form.Group>
                </div>
                <div className="item-wrapper"
                    id="div-task-table"
                    hidden={!taskLoad}>
                    <TableDataContext.Provider value={{ groupInfo, changeTableData }}>
                        <TaskGroupTable taskId={taskId} taskPath={taskPath} />
                    </TableDataContext.Provider>
                </div>
            </div>
        </>
    )

}

export default AutoCalib;