
import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form';
import { configData } from './exodus.js'
import { getGroundImage } from './util.js'
import '../css/canvas.css';

export const PairCanvas = ({ leftImage, rightImage, jobId, taskId, groupId, changeHandle }) => {
    const groundtype =
        [
            'GROUND TYPE',
            'BASEBALL-HOME',
            'BASEBALL',
            'BASKETBALL-HALF',
            'BASKBALL',
            'BOXING',
            'ICELINK-HALF',
            'ICELINK',
            'SOCCER-HALF',
            'SOCCER',
            'TAEKWONDO',
            'TENNINS-HALF',
            'TENNIS',
            'UFC',
            'VOLLEYBALL-HALF',
            'VOLLEYBALL',
            'FOOTBALL'
        ];

    const { configure, changeConfigure } = useContext(configData)
    const canvasLeftRef = useRef(null);
    const canvasRightRef = useRef(null);
    const canvasWorldRef = useRef(null);

    const leftImageRef = useRef(null);
    const rightImageRef = useRef(null);
    const worldImageRef = useRef(null);

    const mousePosLeftRef = useRef(null);
    const mousePosRightRef = useRef(null);
    const mousePosWorldRef = useRef(null);

    const targetInfoLeftRef = useRef(null);
    const targetInfoRightRef = useRef(null);
    const targetInfoWorldRef = useRef(null);

    const targetPointRef = useRef({ left: [], right: [], world: [] })
    const targetPoint2D = useRef({ left: [], right: [] })
    const targetPoint3D = useRef({ left: [], right: [] })
    const targetPointWorld = useRef([])
    const [ground, setGround] = useState('')
    const [worldImage, setWorldImage] = useState('./ground/Baseball_Ground.png')

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitCompleted, setIsSubmitCompleted] = useState(false);
    const [isAllTarget, setIsAllTarget] = useState(false);
    const [jobid, setJobid] = useState(jobId)
    const [taskid, setTaskid] = useState(taskId)
    const [groupid, setGroupid] = useState(groupId)

    const canvasWidth = parseInt(process.env.REACT_APP_CANVAS_WIDTH, 10);
    const canvasHeight = parseInt(process.env.REACT_APP_CANVAS_HEIGHT, 10);
    const imageWidth = parseInt(process.env.REACT_APP_IMAGE_WIDTH, 10);
    const imageHeight = parseInt(process.env.REACT_APP_IMAGE_HEIGHT, 10);

    const canvas = { left: canvasLeftRef, right: canvasRightRef, world: canvasWorldRef };
    const image = { left: leftImageRef, right: rightImageRef, world: worldImageRef };
    // const canvasworld = canvasWorldRef;

    const mousePos = { left: mousePosLeftRef, right: mousePosRightRef, world: mousePosWorldRef };
    const targetInfo = { left: targetInfoLeftRef, right: targetInfoRightRef, world: targetInfoWorldRef };

    let context = { left: null, right: null, world: null };
    //let contextWorld = null;

    let isDragging = {
        left: false,
        right: false,
        world: false
    }
    let dragStartPosition = {
        left: { x: 0, y: 0 },
        right: { x: 0, y: 0 },
        world: { x: 0, y: 0 }
    }
    let currentTransformedCursor = {
        left: { x: 0, y: 0 },
        right: { x: 0, y: 0 },
        world: { x: 0, y: 0 }
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
    const calibPrevMode = useRef(null)


    const InsertRefPointToStore = (storeMode) => {
        if (storeMode === '2D') {
            targetPoint2D.current.left = [];
            targetPoint2D.current.right = [];
            for (let i = 0; i < targetPointRef.current.left.length; i++) {
                targetPoint2D.current['left'].push({ x: targetPointRef.current.left[i].x, y: targetPointRef.current.left[i].y });
            }

            for (let i = 0; i < targetPointRef.current.right.length; i++) {
                targetPoint2D.current['right'].push({ x: targetPointRef.current.right[i].x, y: targetPointRef.current.right[i].y });
            }

        } else if (storeMode === '3D') {
            targetPoint3D.current.left = [];
            targetPoint3D.current.right = [];
            for (let i = 0; i < targetPointRef.current.left.length; i++) {
                targetPoint3D.current['left'].push({ x: targetPointRef.current.left[i].x, y: targetPointRef.current.left[i].y });
            }

            for (let i = 0; i < targetPointRef.current.right.length; i++) {
                targetPoint3D.current['right'].push({ x: targetPointRef.current.right[i].x, y: targetPointRef.current.right[i].y });
            }
        } else if (storeMode === 'World') {
            targetPointWorld.current = [];
            for (let i = 0; i < targetPointRef.current.world.length; i++) {
                targetPointWorld.current.push({ x: targetPointRef.current.world[i].x, y: targetPointRef.current.world[i].y });
            }
        }
    }

    const styleBtn = { float: 'left', width: '100px', marginLeft: '20px' };

    function ModeChange() {

        setIsAllTarget(false);
        setIsSubmitted(false);
        setIsSubmitCompleted(false);
        // drawImageToCanvas(null, 'left');
        // drawImageToCanvas(null, 'right');
        // drawImageToCanvas(null, 'world');

        console.log("now calibration mode is ", calibMode.current)
        console.log("mode change ", context)

        if (calibMode.current === '3D') {
            InsertRefPointToStore(calibPrevMode.current)

            targetPointRef.current.left = [];
            targetPointRef.current.right = [];
            targetPointRef.current.world = [];
            for (let i = 0; i < targetPoint3D.current.left.length; i++) {
                targetPointRef.current['left'].push({ x: targetPoint3D.current.left[i].x, y: targetPoint3D.current.left[i].y });
            }
            for (let i = 0; i < targetPoint3D.current.right.length; i++) {
                targetPointRef.current['right'].push({ x: targetPoint3D.current.right[i].x, y: targetPoint3D.current.right[i].y });
            }
        }
        else if (calibMode.current === '2D') {
            InsertRefPointToStore(calibPrevMode.current)

            targetPointRef.current.left = [];
            targetPointRef.current.right = [];
            targetPointRef.current.world = [];
            for (let i = 0; i < targetPoint2D.current.left.length; i++) {
                targetPointRef.current['left'].push({ x: targetPoint2D.current.left[i].x, y: targetPoint2D.current.left[i].y });
            }
            for (let i = 0; i < targetPoint2D.current.right.length; i++) {
                targetPointRef.current['right'].push({ x: targetPoint2D.current.right[i].x, y: targetPoint2D.current.right[i].y });
            }

        }
        else if (calibMode.current === 'World') {
            // draw                
            InsertRefPointToStore(calibPrevMode.current)
            targetPointRef.current.left = [];
            targetPointRef.current.right = [];
            targetPointRef.current.world = [];

            for (let i = 0; i < targetPointWorld.current.length; i++) {
                targetPointRef.current['world'].push({ x: targetPointWorld.current[i].x, y: targetPointWorld.current[i].y });
            }
        }

        drawImageToCanvas(null, 'left', true);
        drawImageToCanvas(null, 'right', true);
        drawImageToCanvas(null, 'world', true);

        if (targetPointRef.current['left'].length > 0) {
            drawTarget('left');
        }
        if (targetPointRef.current['right'].length > 0) {
            drawTarget('right');
        }
        if (targetPointRef.current['world'].length > 0) {
            drawTarget('world');
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
    const [varClassWorld, setvarClassWorld] = React.useState("btn-secondary")

    const [calibMode2D, setCalibMode2D] = React.useState(false)
    const [calibMode3D, setCalibMode3D] = React.useState(false)
    const [calibModeWorld, setCalibModeWorld] = React.useState(false)
    const [eMessage, seteMessage] = React.useState("Please select Calibration mode.")

    const ModeButton2D = ({ id, label }) => {
        const handleModeChange = () => {
            console.log("2d button change", calibMode2D, calibMode3D)
            if (calibMode2D === false) {
                setvarClass2D("btn-primary")
                setvarClass3D("btn-secondary")
                setvarClassWorld('btn-secondary')
                seteMessage("2D Calibration mode : You should pick 2 points per each image.")
                calibPrevMode.current = calibMode.current;
                calibMode.current = '2D'
                maxTargetNum.current = 2
                console.log(" 2d calib mode true")
            }
            else {
                // setCalibMode2D(false)
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
            if (calibMode3D === false) {
                setvarClass3D("btn-privary")
                setvarClass2D("btn-secondary")
                setvarClassWorld('btn-secondary')
                calibPrevMode.current = calibMode.current;
                calibMode.current = '3D'
                maxTargetNum.current = 4
                seteMessage("3D Calibration mode : You should pick 4 points per each image.")
                console.log(" 3d calib mode set true")
            }
            else {
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

    const ModeButtonWorld = ({ id, label }) => {
        const handleModeChange = () => {
            console.log("world button change")
            if (calibModeWorld === false) {
                setvarClassWorld("btn-primary")
                setvarClass2D("btn-secondary")
                setvarClass3D("btn-secondary")
                calibPrevMode.current = calibMode.current;
                calibMode.current = 'World'
                maxTargetNum.current = 4

                if (ground !== '') {
                    seteMessage("World Select: Select Ground Type first, and Pick 4 points for 3D calibration.")
                    //draw world image to canvas                  
                } else {
                    seteMessage("Select Ground Type first.")
                }

            }
            else {
                calibMode.current = null
                setvarClassWorld('btn-secondary')
                seteMessage('')
                console.log('world selection mode false')
            }
            ModeChange();
        }

        return (
            <Button size="sm"
                variant='primary'
                className={varClassWorld}
                id={id}
                as="input"
                type='button'
                value={label}
                onClick={handleModeChange}
                style={styleBtn}
            >
            </Button>)
    };


    const SelectGroundType = () => {
        const onHandleChange = (target) => {
            console.log(target.selectedIndex, target.value);
            const imgsrc = getGroundImage(target.selectedIndex)
            setGround(target.value)
            setWorldImage(imgsrc)
            console.log('select ground type ', target.value, worldImage)
            // drawImageToCanvas(null, 'world', true)
            initContext('world')
            clearPoints()
        }

        return (
            <Form.Select id="groundtype-select"
                onChange={(event) => onHandleChange(event.target)} value={ground} >
                {groundtype.map((item) => (
                    <option value={item} key={item}>{item}</option>
                ))}
            </Form.Select>
        )
    }

    const clearPoints = () => {
        targetPointRef.current.left = [];
        targetPointRef.current.right = [];
        targetPointRef.current.world = [];
        targetInfo.left.current.innerText = '';
        targetInfo.right.current.innerText = '';
        targetInfo.world.current.innerText = '';

        setIsAllTarget(false);
        setIsSubmitted(false);
        setIsSubmitCompleted(false);
        drawImageToCanvas(null, 'left', true);
        drawImageToCanvas(null, 'right', true);
        drawImageToCanvas(null, 'world', true);
        console.log("clear points is called .");
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
            parseInt(targetPoint2D.current.left[0].x), parseInt(targetPoint2D.current.left[0].y),
            parseInt(targetPoint2D.current.left[1].x), parseInt(targetPoint2D.current.left[1].y),

            parseInt(targetPoint2D.current.right[0].x), parseInt(targetPoint2D.current.right[0].y),
            parseInt(targetPoint2D.current.right[1].x), parseInt(targetPoint2D.current.right[1].y),
        ];
        // const points = [
        //     targetPoint2D.current.left[0].x, targetPoint2D.current.left[0].y,
        //     targetPoint2D.current.left[1].x, targetPoint2D.current.left[1].y,

        //     targetPoint2D.current.right[0].x, targetPoint2D.current.right[0].y,
        //     targetPoint2D.current.right[1].x, targetPoint2D.current.right[1].y,
        // ];

        return points;
    }

    const makeTargetData_World = () => {
        if (targetPointWorld.current.length < process.env.REACT_APP_MAX_TARGET_NUM_3D ||
            targetPointWorld.current.length < process.env.REACT_APP_MAX_TARGET_NUM_3D) {
            console.log("world points is not enough")
            return

        }

        console.log(`x: ${targetPointWorld.current[0].x}, y: ${targetPointWorld.current[0].y}`);
        console.log(`x: ${targetPointWorld.current[1].x}, y: ${targetPointWorld.current[1].y}`);
        console.log(`x: ${targetPointWorld.current[2].x}, y: ${targetPointWorld.current[2].y}`);
        console.log(`x: ${targetPointWorld.current[3].x}, y: ${targetPointWorld.current[3].y}`);

        const points = [
            targetPointWorld.current[0].x, targetPointWorld.current[0].y,
            targetPointWorld.current[1].x, targetPointWorld.current[1].y,
            targetPointWorld.current[2].x, targetPointWorld.current[2].y,
            targetPointWorld.current[3].x, targetPointWorld.current[3].y,
        ];

        return points;
    }

    const submitPoints = async () => {
        let activeMode = 0
        if (calibMode.current === '2D') {
            InsertRefPointToStore('2D')
        } else if (calibMode.current === '3D') {
            InsertRefPointToStore('3D')
        } else if (calibMode.current === 'World') {
            InsertRefPointToStore('World')
        }
        console.log('submit points is called job_id : ', jobid)
        console.log(process.env.REACT_APP_MAX_TARGET_NUM_2D)
        console.log(process.env.REACT_APP_MAX_TARGET_NUM_3D)

        if (targetPoint2D.current.left.length === parseInt(process.env.REACT_APP_MAX_TARGET_NUM_2D) &&
            targetPoint2D.current.right.length === parseInt(process.env.REACT_APP_MAX_TARGET_NUM_2D)) {
            activeMode = activeMode + 2
        }
        if (targetPoint3D.current.left.length === parseInt(process.env.REACT_APP_MAX_TARGET_NUM_3D) &&
            targetPoint3D.current.right.length === parseInt(process.env.REACT_APP_MAX_TARGET_NUM_3D)) {
            activeMode = activeMode + 3
        }
        console.log("submitPoints ", activeMode)
        if (activeMode === 0) {
            seteMessage("NOT enough to generate calibration data. Please pick points again")
            return
        } else if (activeMode === 2) {
            seteMessage("2D calibraiton data request is sended");
        } else if (activeMode === 3) {
            seteMessage("3D calibraiton data request is sended");
        } else if (activeMode === 5) {
            seteMessage("2D+3D calibraiton data request is sended.");
        }

        setIsSubmitted(true);
        const img1 = leftImage.split('/')
        const img2 = rightImage.split('/')
        console.log('submitPoints image par : ', img1[img1.length - 1], img2[img2.length - 1])

        const data = {
            task_id: taskid,
            group_id: groupid,
            job_id: jobid,
            pts_2d: makeTargetData_2d(),
            pts_3d: makeTargetData_3d(),
            world: makeTargetData_World(),
            image1: img1[img1.length - 1],
            image2: img2[img2.length - 1],
            config: configure
        }

        console.log('submit points to : ', jobId)
        const url = process.env.REACT_APP_SERVER_URL + `/api/generate/${jobid}`;

        let response = null;

        try {
            response = await axios.post(url, data);
        } catch (err) {
            console.log(err);
            return;
        }

        if (response && response.data.status === 0) {
            if (response.data.status === 0) {
                setIsSubmitCompleted(true);
                changeHandle('addgenid', [groupid, response.data.job_id])
                changeHandle('changegenmsg', [groupid, `Genenerate pts - ${response.data.job_id} is requested.`])
                changeHandle('addpostno', [groupid, response.data.request_id])
            }
        }
    }

    const initContext = (type) => {
        context = {
            left: canvasLeftRef.current.getContext('2d'),
            right: canvasRightRef.current.getContext('2d'),
            world: canvasWorldRef.current.getContext('2d')
        };

        if (type === 'left') {
            canvasLeftRef.current.addEventListener('mousedown', (event) => onMouseDown(event, 'left', context), { passive: false });
            canvasLeftRef.current.addEventListener('mouseup', (event) => onMouseUp(event, 'left', context), { passive: false });
            canvasLeftRef.current.addEventListener('mousemove', (event) => onMouseMove(event, 'left', context), { passive: false });
            canvasLeftRef.current.addEventListener('wheel', (event) => onWheel(event, 'left', context), { passive: false });
            canvasLeftRef.current.addEventListener('contextmenu', (event) => onRightClick(event, 'left', context), { passive: false });

        }
        else if (type === 'right') {
            canvasRightRef.current.addEventListener('mousedown', (event) => onMouseDown(event, 'right', context), { passive: false });
            canvasRightRef.current.addEventListener('mouseup', (event) => onMouseUp(event, 'right', context), { passive: false });
            canvasRightRef.current.addEventListener('mousemove', (event) => onMouseMove(event, 'right', context), { passive: false });
            canvasRightRef.current.addEventListener('wheel', (event) => onWheel(event, 'right', context), { passive: false });
            canvasRightRef.current.addEventListener('contextmenu', (event) => onRightClick(event, 'right', context), { passive: false });
        }
        else if (type === 'world') {
            canvasWorldRef.current.addEventListener('mousedown', (event) => onMouseDown(event, 'world', context), { passive: false });

            canvasWorldRef.current.addEventListener('mouseup', (event) => onMouseUp(event, 'world', context), { passive: false });
            canvasWorldRef.current.addEventListener('mousemove', (event) => onMouseMove(event, 'world', context), { passive: false });
            // canvasWorldRef.current.addEventListener('wheel', (event) => onWheel(event, 'world', context), { passive: false });
            canvasWorldRef.current.addEventListener('contextmenu', (event) => onRightClick(event, 'world', context), { passive: false });

        }

        if (context[type]) {
            context[type].save();
            // context[type].setTransform(1, 0, 0, 1, 0, 0);
            if (type === 'world') {
                context[type].clearRect(0, 0, 800, 800);
            } else {
                context[type].clearRect(0, 0, canvas[type].current.width, canvas[type].current.height);
            }
            context[type].restore();
            if (type === 'world') {
                // context[type].scale(1.55, 0.74);
                context[type].drawImage(image[type].current, 0, 0, 800, 800);
            } else {
                context[type].scale(0.32, 0.32);
                context[type].drawImage(image[type].current, 0, 0, imageWidth, imageHeight);
            }
        }

    }

    const drawImageToCanvas = (e, type, isInit) => {
        context = {
            left: canvasLeftRef.current.getContext('2d'),
            right: canvasRightRef.current.getContext('2d'),
            world: canvasWorldRef.current.getContext('2d')
        };

        // contextWorld = canvasWorldRef.current.getContext('2d')
        // console.log('drawImageToCanvas : ', context)
        // console.log('type : ', type)

        if (context[type]) {
            context[type].save();
            context[type].setTransform(1, 0, 0, 1, 0, 0);
            if (type === 'world') {
                context[type].clearRect(0, 0, 800, 800);
            } else {
                context[type].clearRect(0, 0, canvas[type].current.width, canvas[type].current.height);
            }
            context[type].restore();

            if (type === 'world') {
                // context[type].scale(1.55, 0.74);
                context[type].drawImage(image[type].current, 0, 0, 800, 800);
            } else {
                context[type].drawImage(image[type].current, 0, 0, imageWidth, imageHeight);
            }
        }
    }

    const getTransformedPoint = (x, y, type, context) => {
        // console.log("getTransform context : ", context)
        const transform = context[type].getTransform();
        const inverseZoom = 1 / transform.a;

        const transformedX = inverseZoom * x - inverseZoom * transform.e;
        const transformedY = inverseZoom * y - inverseZoom * transform.f;

        return { x: Math.round(transformedX), y: Math.round(transformedY) };
    }

    const drawCircle = (x, y, radius, color, type) => {
        // console.log("drawCircle is called context : " + context)

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
        // console.log("drawTarget context: ", context)
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

    const onMouseDown = (event, type, context) => {
        isDragging[type] = true;
        dragStartPosition[type] = getTransformedPoint(event.offsetX, event.offsetY, type, context);
    }

    const onMouseUp = (event, type, context) => {
        isDragging[type] = false;
    }

    const onMouseMove = (event, type, context) => {
        // console.log("onMouseMove : ", context)
        currentTransformedCursor[type] = getTransformedPoint(event.offsetX, event.offsetY, type, context);
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

    const onRightClick = (e, type, context) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        // console.log("onRightClick context ", context);

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

    const onWheel = (event, type, context) => {
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

    return (
        <>
            <div className="modebtn-wrapper">
                <Row>
                    <div>
                        <Form.Group className="modeButton">
                            <ModeButton2D id='2d-mode' label='2D' ></ModeButton2D>
                            <ModeButton3D id='3d-mode' label='3D' ></ModeButton3D>
                            <ModeButtonWorld id='world' label='World' ></ModeButtonWorld>
                            <SelectGroundType />
                            {/* <DropdownButton id="dropdown-event" size="sm" menuVariant='dark' title="GROUND TYPE" style={styleBtn} >
                                <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                                <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                                <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
                            </DropdownButton> */}
                            <Button
                                size="sm"
                                variant="primary"
                                className="item-btn-wrapper"
                                id='submit'
                                as="input"
                                type='button'
                                value="Submit"
                                onClick={submitPoints}
                                style={{ float: 'right', width: '120px', marginRight: '10px' }}
                                disabled={isSubmitCompleted === true}
                            >
                            </Button>
                            <Button
                                size="sm"
                                variant="primary"
                                id='clear-point'
                                as="input"
                                type='button'
                                value="Clear Points"
                                onClick={clearPoints}
                                style={{ float: 'right', width: '120px', marginRight: '10px' }}
                            >
                            </Button>

                        </Form.Group>
                    </div>
                </Row>
                <Row>
                    <div className="modebtn-message">
                        <span >{eMessage}</span>
                    </div>
                </Row>
            </div >
            <div>
                <div className='canvas-wrapper' hidden={calibMode.current === 'World'} dialbed={calibMode.current === 'World'}>
                    <Form.Group>
                        <img
                            id='left-image'
                            ref={leftImageRef}
                            src={leftImage}
                            onLoad={(e) => initContext('left')}
                            hidden={true}
                        />
                        <canvas
                            id='canvas-left'
                            ref={canvasLeftRef}
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
                </div>
                <div className='canvas-wrapper' hidden={calibMode.current === 'World'} disalbed={calibMode.current === 'World'}>
                    <Form.Group>
                        <img
                            id='right-image'
                            ref={rightImageRef}
                            src={rightImage}
                            onLoad={(e) => initContext('right')}
                            hidden={true}
                        />
                        <canvas
                            id='canvas-right'
                            ref={canvasRightRef}
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
                <div className='canvas-wrapper' hidden={calibMode.current !== 'World'}>
                    <Form.Group>
                        <img
                            id='world-image'
                            ref={worldImageRef}
                            src={worldImage}
                            onLoad={(e) => initContext('world')}
                            hidden={true}
                        />
                        <canvas
                            id='canvas-world'
                            ref={canvasWorldRef}
                            width={800}
                            height={800}
                        >
                        </canvas>
                        <div
                            id='mouse-pos-right'
                            ref={mousePosWorldRef}
                        />
                        <div
                            id='target-right'
                            ref={targetInfoWorldRef}
                        />
                    </Form.Group>
                </div>

            </div>
        </>
    );
}