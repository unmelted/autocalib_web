import React, { useState, useRef } from 'react';
import axios from 'axios';
import '../css/autocalib.css';
import ProgressBar from 'react-bootstrap/ProgressBar'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup';
import { getTotalFileSize, getFileExt, isValidFile, isValidImage } from './util.js'
import { TaskGroupTable } from './task.js'



function AutoCalib() {
    const [taskId, setTaskId] = useState('');
    const [taskPath, setTaskPath] = useState('');
    const [taskLoad, setTaskLoad] = useState(false);

    const taskAlias = useRef(null);
    const [statusMessage, setStatusMessage] = useState("");
    const [isUploaded, setIsUploaded] = useState(false)

    const [percent, setPercent] = useState(0);

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
            await addFileAlias(response.data.taskId);
            console.log("add file alias  call");
            console.log("get group  call");
            setTaskPath(response.data.taskPath);
            setTaskId(response.data.taskId);
            setTaskLoad(true);

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
    const addFileAlias = async (taskId) => {
        let response = null;
        const task_alias = taskAlias.current.value;
        console.log("addFileAlias function : ", task_alias, taskId)

        const data = {
            task_alias: task_alias,
            task_id: taskId,
        }

        try {
            response = await axios.post(process.env.REACT_APP_SERVER_URL + "/control/addalias", data)
        } catch (err) {
            console.log(err);
            return;
        }

        if (response && response.data) {

        }
    }

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
                <InputGroup size="sm" className="mb-3" id="filealias-input">
                    <InputGroup.Text id="basic-addon1">
                        Create Task with Alias
                    </InputGroup.Text>
                    <Form.Control
                        placeholder=""
                        aria-label="filealias"
                        aria-describedby="basic-addon1"
                        ref={taskAlias}
                    />
                </InputGroup>
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
                <div id='button-row-reset'>
                    <Form.Group className='item-btn-wrppter'>
                        <Button size="md"
                            variant="primary"
                            className="item-btn-wrapper"
                            id='reset'
                            as="input"
                            type='button'
                            value="Reset"
                            onClick={reset}
                            disabled={!isUploaded}
                        >
                        </Button>
                    </Form.Group>
                </div>
                <div id="div-task-table"
                    hidden={taskLoad === false}>
                    <TaskGroupTable taskId={taskId} taskPath={taskPath} entry={'create'} />
                </div>
            </div>
        </>
    )

}

export default AutoCalib;