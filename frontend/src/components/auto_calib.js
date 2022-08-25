import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../upload.css';
import ProgressBar from 'react-bootstrap/ProgressBar'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { saveAs } from 'file-saver';

const AutoCalib = props => {
    const canvasLeftRef = useRef(null);
    const canvasRightRef = useRef(null);
    const leftImageRef = useRef(null);
    const rightImageRef = useRef(null);
    const mousePosLeftRef = useRef(null);
    const mousePosRightRef = useRef(null);
    const targetInfoLeftRef = useRef(null);
    const targetInfoRightRef = useRef(null);
    const targetPointRef = useRef({ left: [], right: [] });
    const targetPoint2D = useRef({ left: [], right: [] })
    const targetPoint3D = useRef({ left: [], right: [] })
    const calcProgressTimerRef = useRef(0);

    const CALC_STATE = {
        READY: 0,
        START: 1,
        COMPLETE: 2
    }

    const [percent, setPercent] = useState(0);
    const [statusMessage, setStatusMessage] = useState("");
    const [isUploaded, setIsUploaded] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitCompleted, setIsSubmitCompleted] = useState(false);
    const [calculateState, setCalculateState] = useState(CALC_STATE.READY);
    const [isAllTarget, setIsAllTarget] = useState(false);
    const [leftImage, setLeftImage] = useState('');
    const [rightImage, setRightImage] = useState('');
    const [jobId, setJobId] = useState(0);
    const [downloadInfo, setDownloadInfo] = useState({});

    const canvasWidth = parseInt(process.env.REACT_APP_CANVAS_WIDTH, 10);
    const canvasHeight = parseInt(process.env.REACT_APP_CANVAS_HEIGHT, 10);
    const imageWidth = parseInt(process.env.REACT_APP_IMAGE_WIDTH, 10);
    const imageHeight = parseInt(process.env.REACT_APP_IMAGE_HEIGHT, 10);

    const canvas = { left: canvasLeftRef, right: canvasRightRef };
    const image = { left: leftImageRef, right: rightImageRef };
    const mousePos = { left: mousePosLeftRef, right: mousePosRightRef };
    const targetInfo = { left: targetInfoLeftRef, right: targetInfoRightRef };

    let context = { left: null, right: null };
    let isDragging = {
        left: false,
        right: false
    }
    let dragStartPosition = {
        left: { x: 0, y: 0 },
        right: { x: 0, y: 0 }
    }
    let currentTransformedCursor = {
        left: { x: 0, y: 0 },
        right: { x: 0, y: 0 }
    }

    const pointColorPallet = [
        process.env.REACT_APP_POINT_COLOR_1,
        process.env.REACT_APP_POINT_COLOR_2,
        process.env.REACT_APP_POINT_COLOR_3,
        process.env.REACT_APP_POINT_COLOR_4
    ];
    const pointRadius = parseInt(process.env.REACT_APP_POINT_RADIUS, 10);
    const maxTargetNum = useRef(0);
    const calibMode = useRef(null);

    const getTotalFileSize = (files) => {
        let size = 0;

        for (const file of files) {
            size += file.size;
        }

        return size;
    }

    const getFileExt = (file) => {
        let ext = file.name.split('.');

        return (ext.length > 1 ? ext[1].toLowerCase() : '');
    }

    const isValidImage = (file) => {
        const ext = getFileExt(file);

        return (file.type == "image/png" || file.type == "image/jpeg") && (ext == "png" || ext == "jpg" || ext == "jpeg");
    }

    const isValidFile = (file) => {
        const mimeType = file.type;
        const ext = getFileExt(file);

        return isValidImage(file) || ext == "pts" || ext == "txt";
    }

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
        }

    }

    const calculate = async () => {
        console.log("Calculate async calib mode", calibMode)
        canvasLeftRef.current.addEventListener('mousedown', (event) => onMouseDown(event, 'left'), { passive: false });
        canvasLeftRef.current.addEventListener('mouseup', (event) => onMouseUp(event, 'left'), { passive: false });
        canvasLeftRef.current.addEventListener('mousemove', (event) => onMouseMove(event, 'left'), { passive: false });
        canvasLeftRef.current.addEventListener('wheel', (event) => onWheel(event, 'left'), { passive: false });
        canvasLeftRef.current.addEventListener('contextmenu', (event) => onRightClick(event, 'left'), { passive: false });

        canvasRightRef.current.addEventListener('mousedown', (event) => onMouseDown(event, 'right'), { passive: false });
        canvasRightRef.current.addEventListener('mouseup', (event) => onMouseUp(event, 'right'), { passive: false });
        canvasRightRef.current.addEventListener('mousemove', (event) => onMouseMove(event, 'right'), { passive: false });
        canvasRightRef.current.addEventListener('wheel', (event) => onWheel(event, 'right'));
        canvasRightRef.current.addEventListener('contextmenu', (event) => onRightClick(event, 'right'), { passive: false });

        const data = {
            //group: string 그룹 이름
        }

        let response = null;

        try {
            response = await axios.post(process.env.REACT_APP_SERVER_URL + "/api/calculate", data);
        } catch (err) {
            console.log(err);
            setStatusMessage('Unable to calculate!');
            return;
        }

        if (response && response.data.status === 0) {
            setJobId(response.data.job_id);
            setCalculateState(CALC_STATE.START);
            setPercent(0);
            setStatusMessage('Calculating...');
        }
    }

    const getTwoImage = async () => {
        let response = null;

        try {
            console.log({ jobId })
            // response = await axios.get(process.env.REACT_APP_SERVER_URL + `/api/image/${jobId}`);
            response = await axios.get(process.env.REACT_APP_SERVER_URL + `/api/image/1029`);
        } catch (err) {
            console.log(err);
            setStatusMessage('Unable to get images!');
            return;
        }

        const imageUrl = process.env.REACT_APP_SERVER_IMAGE_URL;

        if (response && response.data.status === 0) {
            const imageUrlFirst = imageUrl + response.data.first_image;
            const imageUrlSecond = imageUrl + response.data.second_image;
            console.log(imageUrlFirst)
            console.log(imageUrlSecond)
            setLeftImage(imageUrlFirst);
            setRightImage(imageUrlSecond);
        }
    }

    const reset = () => {
        window.location.reload();
    }

    const InsertRefPointToStorate = (storeMode) => {
        if (storeMode == '2D') {
            targetPoint2D.current.left = [];
            targetPoint2D.current.right = [];
            for (let i = 0; i < targetPointRef.current.left.length; i++) {
                targetPoint2D.current['left'].push({ x: targetPointRef.current.left[i].x, y: targetPointRef.current.left[i].y });
            }

            for (let i = 0; i < targetPointRef.current.right.length; i++) {
                targetPoint2D.current['right'].push({ x: targetPointRef.current.right[i].x, y: targetPointRef.current.right[i].y });
            }

        } else if (storeMode == '3D') {
            targetPoint3D.current.left = [];
            targetPoint3D.current.right = [];
            for (let i = 0; i < targetPointRef.current.left.length; i++) {
                targetPoint3D.current['left'].push({ x: targetPointRef.current.left[i].x, y: targetPointRef.current.left[i].y });
            }

            for (let i = 0; i < targetPointRef.current.right.length; i++) {
                targetPoint3D.current['right'].push({ x: targetPointRef.current.right[i].x, y: targetPointRef.current.right[i].y });
            }

        }
    }

    const styleBtn = { float: 'left', width: '80px', marginLeft: '20px' };
    function ModeChange() {

        setIsAllTarget(false);
        setIsSubmitted(false);
        setIsSubmitCompleted(false);
        drawImageToCanvas(null, 'left');
        drawImageToCanvas(null, 'right');
        console.log("now calibration mode is ", calibMode.current)
        console.log(process.env.REACT_APP_MAX_TARGET_NUM_2D, process.env.REACT_APP_MAX_TARGET_NUM_3D)

        if (calibMode.current == '3D') {
            InsertRefPointToStorate('2D')

            targetPointRef.current.left = [];
            targetPointRef.current.right = [];
            for (let i = 0; i < targetPoint3D.current.left.length; i++) {
                targetPointRef.current['left'].push({ x: targetPoint3D.current.left[i].x, y: targetPoint3D.current.left[i].y });
            }
            for (let i = 0; i < targetPoint3D.current.right.length; i++) {
                targetPointRef.current['right'].push({ x: targetPoint3D.current.right[i].x, y: targetPoint3D.current.right[i].y });
            }
        }
        else if (calibMode.current == '2D') {
            InsertRefPointToStorate('3D')

            targetPointRef.current.left = [];
            targetPointRef.current.right = [];

            for (let i = 0; i < targetPoint2D.current.left.length; i++) {
                targetPointRef.current['left'].push({ x: targetPoint2D.current.left[i].x, y: targetPoint2D.current.left[i].y });
            }
            for (let i = 0; i < targetPoint2D.current.right.length; i++) {
                targetPointRef.current['right'].push({ x: targetPoint2D.current.right[i].x, y: targetPoint2D.current.right[i].y });
            }

        }
        if (targetPointRef.current['left'].length > 0) {
            drawTarget('left');
        }
        if (targetPointRef.current['right'].length > 0) {
            drawTarget('right');
        }

        if ((targetPoint2D.current.left.length === process.env.REACT_APP_MAX_TARGET_NUM_2D &&
            targetPoint2D.current.right.length === process.env.REACT_APP_MAX_TARGET_NUM_2D) ||
            (targetPoint3D.current.left.length === process.env.REACT_APP_MAX_TARGET_NUM_3D &&
                targetPoint3D.current.right.length === process.env.REACT_APP_MAX_TARGET_NUM_3D)) {
            setIsAllTarget(true);
        }
    }

    const [varClass2D, setvarClass2D] = React.useState("btn-secondary")
    const [varClass3D, setvarClass3D] = React.useState("btn-secondary")
    const [calibMode2D, setCalibMode2D] = React.useState(false)
    const [calibMode3D, setCalibMode3D] = React.useState(false)
    const [eMessage, seteMessage] = React.useState("Please select Calibration mode.")
    // useEffect(() => {
    // }, [calibMode2D, calibMode3D]);

    const ModeButton2D = ({ id, label }) => {
        const handleModeChange = () => {
            console.log("2d button change", calibMode2D, calibMode3D)
            if (calibMode2D == false) {
                setCalibMode2D(true)
                setCalibMode3D(false)
                setvarClass2D("btn-primary")
                setvarClass3D("btn-secondary")
                seteMessage("2D Calibration mode : You should pick 2 points per each image.")
                calibMode.current = '2D'
                maxTargetNum.current = 2
                console.log(" 2d calib mode true")
            }
            else {
                setCalibMode2D(false)
                calibMode.current = null
                setvarClass2D("btn-secondary")
                seteMessage("")
                console.log(" 2d calib mode false")
            }
            ModeChange();
        }

        return (
            <Button size="sm"
                variant='primary'
                className={varClass2D}
                id={id}
                as="input"
                type='button'
                value={label}
                onClick={handleModeChange}
                style={styleBtn}
            >
            </Button>)

    };

    const ModeButton3D = ({ id, label }) => {
        const handleModeChange = () => {
            console.log("3d button change")
            if (calibMode3D == false) {
                setCalibMode2D(false)
                setCalibMode3D(true)
                setvarClass3D("btn-privary")
                setvarClass2D("btn-secondary")
                calibMode.current = '3D'
                maxTargetNum.current = 4
                seteMessage("3D Calibration mode : You should pick 4 points per each image.")
                console.log(" 3d calib mode set true")
            }
            else {
                setCalibMode3D(false)
                calibMode.current = null
                setvarClass3D("btn-secondary")
                seteMessage("")
                console.log(" 3d calib mode set false")
            }
            ModeChange();
        }

        return (
            <Button size="sm"
                variant='primary'
                className={varClass3D}
                id={id}
                as="input"
                type='button'
                value={label}
                onClick={handleModeChange}
                style={styleBtn}
            >
            </Button>)
    };

    const clearPoints = () => {
        targetPointRef.current.left = [];
        targetPointRef.current.right = [];
        targetInfo.left.current.innerText = '';
        targetInfo.right.current.innerText = '';
        setIsAllTarget(false);
        setIsSubmitted(false);
        setIsSubmitCompleted(false);
        drawImageToCanvas(null, 'left');
        drawImageToCanvas(null, 'right');
    }

    const makeTargetData_3d = () => {
        if (targetPoint3D.current.left.length < process.env.REACT_APP_MAX_TARGET_NUM_3D &&
            targetPoint3D.current.right.length < process.env.REACT_APP_MAX_TARGET_NUM_3D) {
            console.log("3d point is not enough")
            return
        }

        console.log("[Target points - Left]");
        console.log(`x: ${targetPoint3D.current.left[0].x}, y: ${targetPoint3D.current.left[0].y}`);
        console.log(`x: ${targetPoint3D.current.left[1].x}, y: ${targetPoint3D.current.left[1].y}`);
        console.log(`x: ${targetPoint3D.current.left[2].x}, y: ${targetPoint3D.current.left[2].y}`);
        console.log(`x: ${targetPoint3D.current.left[3].x}, y: ${targetPoint3D.current.left[3].y}`);

        console.log("[Target points - Right]");
        console.log(`x: ${targetPoint3D.current.right[0].x}, y: ${targetPoint3D.current.right[0].y}`);
        console.log(`x: ${targetPoint3D.current.right[1].x}, y: ${targetPoint3D.current.right[1].y}`);
        console.log(`x: ${targetPoint3D.current.right[2].x}, y: ${targetPoint3D.current.right[2].y}`);
        console.log(`x: ${targetPoint3D.current.right[3].x}, y: ${targetPoint3D.current.right[3].y}`);

        const points = [
            targetPoint3D.current.left[0].x, targetPoint3D.current.left[0].y,
            targetPoint3D.current.left[1].x, targetPoint3D.current.left[1].y,
            targetPoint3D.current.left[2].x, targetPoint3D.current.left[2].y,
            targetPoint3D.current.left[3].x, targetPoint3D.current.left[3].y,

            targetPoint3D.current.right[0].x, targetPoint3D.current.right[0].y,
            targetPoint3D.current.right[1].x, targetPoint3D.current.right[1].y,
            targetPoint3D.current.right[2].x, targetPoint3D.current.right[2].y,
            targetPoint3D.current.right[3].x, targetPoint3D.current.right[3].y,
        ];

        return points;
    }

    const makeTargetData_2d = () => {
        if (targetPoint2D.current.left.length < process.env.REACT_APP_MAX_TARGET_NUM_2D ||
            targetPoint2D.current.right.length < process.env.REACT_APP_MAX_TARGET_NUM_2D) {
            console.log("2d points is not enough")
            return
        }

        console.log("[Target points - Left]");
        console.log(`x: ${targetPoint2D.current.left[0].x}, y: ${targetPoint2D.current.left[0].y}`);
        console.log(`x: ${targetPoint2D.current.left[1].x}, y: ${targetPoint2D.current.left[1].y}`);

        console.log("[Target points - Right]");
        console.log(`x: ${targetPoint2D.current.right[0].x}, y: ${targetPoint2D.current.right[0].y}`);
        console.log(`x: ${targetPoint2D.current.right[1].x}, y: ${targetPoint2D.current.right[1].y}`);

        const points = [
            targetPoint2D.current.left[0].x, targetPoint2D.current.left[0].y,
            targetPoint2D.current.left[1].x, targetPoint2D.current.left[1].y,

            targetPoint2D.current.right[0].x, targetPoint2D.current.right[0].y,
            targetPoint2D.current.right[1].x, targetPoint2D.current.right[1].y,
        ];

        return points;
    }

    const submitPoints = async () => {
        let activeMode = 0
        if (calibMode.current == '2D') {
            InsertRefPointToStorate('2D')
        } else if (calibMode.current == '3D') {
            InsertRefPointToStorate('3D')
        }

        console.log(process.env.REACT_APP_MAX_TARGET_NUM_2D)
        console.log(process.env.REACT_APP_MAX_TARGET_NUM_3D)

        if (targetPoint2D.current.left.length == process.env.REACT_APP_MAX_TARGET_NUM_2D &&
            targetPoint2D.current.right.length == process.env.REACT_APP_MAX_TARGET_NUM_2D) {
            activeMode = activeMode + 2
        }
        if (targetPoint3D.current.left.length == process.env.REACT_APP_MAX_TARGET_NUM_3D &&
            targetPoint3D.current.right.length == process.env.REACT_APP_MAX_TARGET_NUM_3D) {
            activeMode = activeMode + 3
        }
        console.log("submitPoints ", activeMode)
        if (activeMode == 0) {
            seteMessage("NOT enough to generate calibration data. Please pick points again")
            return
        } else if (activeMode == 2) {
            seteMessage("2D calibraiton data will be generated.")
        } else if (activeMode == 3) {
            seteMessage("3D calibraiton data will be generated.")
        } else if (activeMode == 5) {
            seteMessage("2D+3D calibraiton data will be generated.")
        }

        setIsSubmitted(true);

        const data = {
            job_id: jobId,
            pts_2d: makeTargetData_2d(),
            pts_3d: makeTargetData_3d()
        }

        const url = process.env.REACT_APP_SERVER_URL + `/api/generate/${jobId}`;

        let response = null;

        try {
            response = await axios.post(url, data);
        } catch (err) {
            console.log(err);
            setStatusMessage('Unable to calculate!');
            return;
        }

        if (response && response.data.status === 0) {
            if (response.data.status === 0) {
                const fileName = process.env.REACT_APP_PTS_FILENAME + response.data.job_id + '.' + process.env.REACT_APP_PTS_FILE_EXT;
                const downloadUrl = process.env.REACT_APP_SERVER_IMAGE_URL + fileName;
                setDownloadInfo({ url: downloadUrl, name: fileName });
                setIsSubmitCompleted(true);
            }
        }
    }

    const downloadResult = () => {
        saveAs(downloadInfo.url, downloadInfo.name);
    }

    const initContext = () => {
        context = {
            left: canvasLeftRef.current.getContext('2d'),
            right: canvasRightRef.current.getContext('2d')
        };
    }

    const drawImageToCanvas = (e, type, isInit) => {
        if (isInit) {
            initContext();
        }
        context[type].save();
        context[type].setTransform(1, 0, 0, 1, 0, 0);
        context[type].clearRect(0, 0, canvas[type].current.width, canvas[type].current.height);
        context[type].restore();

        if (isInit) {
            context[type].scale(0.16, 0.16);
        }
        context[type].drawImage(image[type].current, 0, 0, imageWidth, imageHeight);
    }

    const getTransformedPoint = (x, y, type) => {
        const transform = context[type].getTransform();
        const inverseZoom = 1 / transform.a;

        const transformedX = inverseZoom * x - inverseZoom * transform.e;
        const transformedY = inverseZoom * y - inverseZoom * transform.f;

        return { x: Math.round(transformedX), y: Math.round(transformedY) };
    }

    const drawCircle = (x, y, radius, color, type) => {
        context[type].beginPath();
        context[type].arc(x, y, radius, 0, 2 * Math.PI, false);
        context[type].fillStyle = 'transparent';
        context[type].fill();
        context[type].lineWidth = process.env.REACT_APP_POINT_LINE_WIDTH;
        context[type].strokeStyle = color;
        context[type].stroke();
    }

    const drawTargetArea = (type) => {
        context[type].lineWidth = process.env.REACT_APP_AREA_LINE_WIDTH;
        context[type].strokeStyle = process.env.REACT_APP_LINE_COLOR;

        context[type].beginPath();
        for (let i = 0; i < maxTargetNum.current; i++) {
            context[type].lineTo(targetPointRef.current[type][i].x, targetPointRef.current[type][i].y);
        }
        context[type].lineTo(targetPointRef.current[type][0].x, targetPointRef.current[type][0].y);
        context[type].stroke();
    }

    const drawTarget = (type) => {
        if (targetPointRef.current[type].length > maxTargetNum.current) {
            return;
        }

        //targetInfo[type].innerText = `X: ${currentTransformedCursor[type].x}, Y: ${currentTransformedCursor[type].y}`;
        targetInfo[type].current.style.fontSize = '12px';
        targetInfo[type].current.innerText = "Target Points: ";

        for (let i = 0; i < targetPointRef.current[type].length; i++) {
            drawCircle(targetPointRef.current[type][i].x, targetPointRef.current[type][i].y, pointRadius / 2, pointColorPallet[i], type);
            drawCircle(targetPointRef.current[type][i].x, targetPointRef.current[type][i].y, pointRadius, pointColorPallet[i], type);
            drawCircle(targetPointRef.current[type][i].x, targetPointRef.current[type][i].y, pointRadius + 8, pointColorPallet[i], type);
            targetInfo[type].current.innerText += `[${targetPointRef.current[type][i].x}, ${targetPointRef.current[type][i].y}], `;
        }

        if (targetPointRef.current[type].length === maxTargetNum.current) {
            drawTargetArea(type);
        }

    }

    const onMouseDown = (event, type) => {
        isDragging[type] = true;
        dragStartPosition[type] = getTransformedPoint(event.offsetX, event.offsetY, type);
    }

    const onMouseUp = (event, type) => {
        isDragging[type] = false;
    }

    const onMouseMove = (event, type) => {
        currentTransformedCursor[type] = getTransformedPoint(event.offsetX, event.offsetY, type);
        //mousePos[type].innerText = `Original X: ${event.offsetX}, Y: ${event.offsetY}`;
        mousePos[type].current.innerText = `X: ${currentTransformedCursor[type].x}, Y: ${currentTransformedCursor[type].y}`;

        if (isDragging[type]) {
            context[type].translate(currentTransformedCursor[type].x - dragStartPosition[type].x, currentTransformedCursor[type].y - dragStartPosition[type].y);
            drawImageToCanvas(event, type);
            if (targetPointRef.current[type].length > 0 || targetPointRef.current[type].length > 0) {
                drawTarget(type);
            }
        }
    }

    const onRightClick = (e, type) => {
        e.preventDefault();
        console.log("onRightClick is called ")
        console.log(calibMode.current)

        if (calibMode.current == null) {
            seteMessage("Please select calibration mode FIRST!")
            return null
        }

        console.log(currentTransformedCursor[type].x, currentTransformedCursor[type].y)
        console.log(targetPointRef.current[type].length)
        console.log(maxTargetNum.current)

        if (targetPointRef.current[type].length < maxTargetNum.current) {
            targetPointRef.current[type].push({ x: currentTransformedCursor[type].x, y: currentTransformedCursor[type].y });

            drawTarget(type);
        }

        if (targetPointRef.current.left.length === maxTargetNum.current &&
            targetPointRef.current.right.length === maxTargetNum.current) {
            setIsAllTarget(true);
        }
    }

    const onWheel = (event, type) => {
        const zoom = event.deltaY < 0 ? 1.1 : 0.9;
        context[type].translate(currentTransformedCursor[type].x, currentTransformedCursor[type].y);
        context[type].scale(zoom, zoom);
        context[type].translate(-currentTransformedCursor[type].x, -currentTransformedCursor[type].y);

        drawImageToCanvas(event, type);
        if (targetPointRef.current[type].length > 0 || targetPointRef.current[type].length > 0) {
            drawTarget(type);
        }

        event.preventDefault();
    }

    const removeCalcTimer = () => {
        clearInterval(calcProgressTimerRef.current);
        calcProgressTimerRef.current = null;
    }
    useEffect(() => {
        initContext();
        console.log("usereffect canvas is called")
    }, [canvas]);

    useEffect(() => {
        if (isUploaded && calculateState === CALC_STATE.START) {
            calcProgressTimerRef.current = setInterval(() => {
                axios.get(process.env.REACT_APP_SERVER_URL + `/api/calculate/status/${jobId}`)
                    .then(response => {
                        const percent = parseInt(response.data.percent);

                        if (percent === 100) {
                            removeCalcTimer();
                            setPercent(percent);
                            setCalculateState(CALC_STATE.COMPLETE);
                            setStatusMessage('Calculate Completed!');
                            getTwoImage();
                        } else {
                            setPercent(percent);
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        removeCalcTimer();
                    });
            }, 2000);
        }
        return () => {
            removeCalcTimer();
        }
    }, [calculateState]);

    // useEffect(() => {
    //     targetPointRef.current = {
    //         left: [],
    //         right: []
    //     };
    // }, []);

    return (
        <>
            <div className="container">
                <div className="row">
                    <form>
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
                                    id='status'
                                    type='text'
                                    value={statusMessage}
                                    readOnly={true}
                                    style={{ color: 'blue' }}
                                />
                            </Form.Group>
                            <Form.Group className='item-wrapper'>
                                <Button size="sm"
                                    variant="primary"
                                    className="item-btn-wrapper"
                                    id='reset'
                                    as="input"
                                    type='button'
                                    value="Reset"
                                    onClick={reset}
                                    style={{ float: 'right' }}
                                    disabled={!isUploaded}
                                >
                                </Button>
                                <Button size="sm"
                                    variant="primary"
                                    className="item-btn-wrapper"
                                    id='calculate'
                                    as="input"
                                    type='button'
                                    value="Calculate"
                                    onClick={calculate}
                                    style={{ float: 'right' }}
                                    disabled={!isUploaded || calculateState !== CALC_STATE.READY}
                                >
                                </Button>
                            </Form.Group>
                        </div>
                    </form>
                </div>
                <div
                    className="container"
                    style={{
                        border: '1px solid gray',
                        marginTop: '15px',
                        height: '60px'
                    }}
                >
                    <div >
                        <Form.Group className="modeButton">
                            <ModeButton2D id='2d-mode' label='2D' ></ModeButton2D>
                            <ModeButton3D id='3d-mode' label='3D' ></ModeButton3D>
                            <span style={{ marginLeft: '30px' }}>{eMessage}</span>
                        </Form.Group>
                    </div>
                </div>
            </div>
            <div
                className="container"
                style={{
                    border: '1px solid gray',
                    marginTop: '20px',
                    height: '430px'
                }}
            >

                <div className="row">
                    <div style={{ display: 'flex' }} >

                        <Form.Group className='item-wrapper'
                            style={{
                                marginLeft: '23px'
                            }}
                            hidden={calculateState !== CALC_STATE.COMPLETE}
                        >
                            <img
                                id='left-image'
                                ref={leftImageRef}
                                src={leftImage}
                                onLoad={(e) => drawImageToCanvas(e, 'left', true)}
                                hidden={true}
                            />
                            <canvas
                                id='canvas-left'
                                ref={canvasLeftRef}
                                style={{
                                    border: '1px solid gray',
                                }}
                                width={canvasWidth}
                                height={canvasHeight}
                            >
                            </canvas>
                            <div
                                id='mouse-pos-left'
                                ref={mousePosLeftRef}
                            />
                            <div
                                id='target-left'
                                ref={targetInfoLeftRef}
                            />
                        </Form.Group>
                        <Form.Group className='item-wrapper'
                            style={{
                                marginLeft: '23px'
                            }}
                            hidden={calculateState !== 2}
                        >
                            <img
                                id='right-image'
                                ref={rightImageRef}
                                src={rightImage}
                                onLoad={(e) => drawImageToCanvas(e, 'right', true)}
                                hidden={true}
                            />
                            <canvas
                                id='canvas-right'
                                ref={canvasRightRef}
                                style={{
                                    border: '1px solid gray'
                                }}
                                width={canvasWidth}
                                height={canvasHeight}
                            >
                            </canvas>
                            <div
                                id='mouse-pos-right'
                                ref={mousePosRightRef}
                            />
                            <div
                                id='target-right'
                                ref={targetInfoRightRef}
                            />
                        </Form.Group>
                    </div>
                </div>
            </div>
            <div
                className="container"
                style={{
                    marginTop: '15px',
                }}
            >
                <div className='row' style={{ float: 'right' }}>
                    <div style={{ display: 'flex' }} >
                        <Form.Group hidden={calculateState !== 2}>
                            <Button
                                variant="primary"
                                className="item-btn-wrapper"
                                id='clear-point'
                                as="input"
                                type='button'
                                value="Clear Points"
                                onClick={clearPoints}
                                style={{ float: 'right' }}
                                disabled={!isUploaded || calculateState !== CALC_STATE.COMPLETE}
                            >
                            </Button>
                            <Button
                                variant="primary"
                                className="item-btn-wrapper"
                                id='submit'
                                as="input"
                                type='button'
                                value="Submit"
                                onClick={submitPoints}
                                style={{ float: 'right' }}
                                disabled={!isUploaded || calculateState !== CALC_STATE.COMPLETE || !isAllTarget || isSubmitted}
                                hidden={isSubmitted}
                            >
                            </Button>
                            <Button
                                variant="primary"
                                className="item-btn-wrapper"
                                id='submit'
                                as="input"
                                type='button'
                                value="Download Result"
                                onClick={downloadResult}
                                style={{ float: 'right' }}
                                disabled={!isSubmitCompleted}
                                hidden={!isSubmitted}
                            >
                            </Button>
                        </Form.Group>
                    </div>
                </div>
            </div>
        </>
    )

}

export default AutoCalib;