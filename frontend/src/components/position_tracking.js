
import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form';
import { configData } from './exodus.js'
import '../css/canvas.css';

export const PositionTracking = ({ request_id, group_id, task_id, job_id }) => {

	console.log("position tracking : ", request_id, group_id, task_id, job_id)
	const { configure, changeConfigure } = useContext(configData)
	const canvasRef = useRef(null);
	const imageRef = useRef(null);
	const mousePosRef = useRef(null);
	const targetInfoRef = useRef(null);

	const targetPointRef = useRef([]);
	const [ptImage, setPtImage] = useState('')
	const [ptInputDone, setPtInputDone] = useState(false)
	const [isApplied, setIsApplied] = useState(false);
	const [message, setMessage] = useState('')
	const [description, setDescription] = useState('')

	const canvasWidth = parseInt(process.env.REACT_APP_CANVAS_WIDTH, 10);
	const canvasHeight = parseInt(process.env.REACT_APP_CANVAS_HEIGHT, 10);
	const imageWidth = parseInt(process.env.REACT_APP_IMAGE_WIDTH, 10);
	const imageHeight = parseInt(process.env.REACT_APP_IMAGE_HEIGHT, 10);

	const canvas = canvasRef;
	const image = imageRef;
	const mousePos = mousePosRef;
	const targetInfo = targetInfoRef;

	let context = null;
	let isDragging = false;
	let dragStartPosition = { x: 0, y: 0 }
	let currentTransformedCursor = {
		x: 0, y: 0
	}

	const pointColorPallet = [
		process.env.REACT_APP_POINT_COLOR_2,
		process.env.REACT_APP_POINT_COLOR_3,
	];

	const pointRadius = parseInt(process.env.REACT_APP_POINT_RADIUS, 10);
	const maxTargetNum = useRef(2);


	const getTransformedPoint = (x, y, context) => {
		// console.log("getTransform context : ", context)
		const transform = context.getTransform();
		const inverseZoom = 1 / transform.a;

		const transformedX = inverseZoom * x - inverseZoom * transform.e;
		const transformedY = inverseZoom * y - inverseZoom * transform.f;

		return { x: Math.round(transformedX), y: Math.round(transformedY) };
	}

	const drawCircle = (x, y, radius, color) => {
		// console.log("drawCircle is called context : " + context)

		context.beginPath();
		context.arc(x, y, radius, 0, 2 * Math.PI, false);
		context.fillStyle = 'transparent';
		context.fill();
		context.lineWidth = process.env.REACT_APP_POINT_LINE_WIDTH;
		context.strokeStyle = color;
		context.stroke();

	}

	const drawTargetArea = () => {

		context.lineWidth = process.env.REACT_APP_AREA_LINE_WIDTH;
		context.strokeStyle = process.env.REACT_APP_LINE_COLOR;

		context.beginPath();
		for (let i = 0; i < maxTargetNum.current; i++) {
			context.lineTo(targetPointRef.current[i].x, targetPointRef.current[i].y);
		}
		context.lineTo(targetPointRef.current[0].x, targetPointRef.current[0].y);
		context.stroke();
	}

	const drawTarget = () => {
		if (targetPointRef.current.length > maxTargetNum.current) {
			return;
		}
		// console.log("drawTarget context: ", context)
		//targetInfo[type].innerText = `X: ${currentTransformedCursor[type].x}, Y: ${currentTransformedCursor[type].y}`;
		targetInfo.current.style.fontSize = '12px';
		targetInfo.current.innerText = "Target Points: ";

		for (let i = 0; i < targetPointRef.current.length; i++) {
			drawCircle(targetPointRef.current[i].x, targetPointRef.current[i].y, pointRadius / 2, pointColorPallet[i]);
			drawCircle(targetPointRef.current[i].x, targetPointRef.current[i].y, pointRadius, pointColorPallet[i]);
			drawCircle(targetPointRef.current[i].x, targetPointRef.current[i].y, pointRadius + 8, pointColorPallet[i]);
			targetInfo.current.innerText += `[${targetPointRef.current[i].x}, ${targetPointRef.current[i].y}], `;
		}

		if (targetPointRef.current.length === maxTargetNum.current) {
			drawTargetArea();
			setPtInputDone(true)
		}

	}

	const onMouseDown = (event, context) => {
		isDragging = true;
		dragStartPosition = getTransformedPoint(event.offsetX, event.offsetY, context);
	}

	const onMouseUp = (event, context) => {
		isDragging = false;
	}

	const onMouseMove = (event, context) => {
		// console.log("onMouseMove : ", context)
		currentTransformedCursor = getTransformedPoint(event.offsetX, event.offsetY, context);
		//mousePos[type].innerText = `Original X: ${event.offsetX}, Y: ${event.offsetY}`;
		mousePos.current.innerText = `X: ${currentTransformedCursor.x}, Y: ${currentTransformedCursor.y}`;

		if (isDragging) {
			context.translate(currentTransformedCursor.x - dragStartPosition.x, currentTransformedCursor.y - dragStartPosition.y);
			drawImageToCanvas(event);
			if (targetPointRef.current.length > 0 || targetPointRef.current.length > 0) {
				drawTarget();
			}
		}
	}

	const onRightClick = (e, context) => {
		e.preventDefault();
		e.stopImmediatePropagation();

		console.log(currentTransformedCursor.x, currentTransformedCursor.y)

		if (targetPointRef.current.length < maxTargetNum.current) {
			targetPointRef.current.push({ x: currentTransformedCursor.x, y: currentTransformedCursor.y });

			drawTarget();
		}

		if (targetPointRef.current.length === maxTargetNum.current &&
			targetPointRef.current.length === maxTargetNum.current) {
			console.log("point target is done. ")
		}
	}

	const onWheel = (event, context) => {
		const zoom = event.deltaY < 0 ? 1.1 : 0.9;
		context.translate(currentTransformedCursor.x, currentTransformedCursor.y);
		context.scale(zoom, zoom);
		context.translate(-currentTransformedCursor.x, -currentTransformedCursor.y);

		drawImageToCanvas(event);
		if (targetPointRef.current.length > 0 || targetPointRef.current.length > 0) {
			drawTarget();
		}

		event.preventDefault();

	}

	const drawImageToCanvas = (e) => {
		context = canvasRef.current.getContext('2d')
		context.save();
		context.setTransform(1, 0, 0, 1, 0, 0);
		context.clearRect(0, 0, canvas.current.width, canvas.current.height);
		context.restore();
		context.drawImage(image.current, 0, 0, imageWidth, imageHeight);

	}

	const clearPoints = () => {
		targetPointRef.current = [];
		targetInfo.current.innerText = '';
		setPtInputDone(false)
		drawImageToCanvas(null);

	}

	const loadData = async () => {
		let response = null;
		let image, use_width, use_height;
		console.log('load data', request_id, job_id)

		try {
			console.log("get geninfo job : ", job_id)
			response = await axios.get(process.env.REACT_APP_SERVER_URL + `/api/getgeninfo/${job_id}`);
		} catch (err) {
			console.log(err);
			return;
		}

		if (response && response.data.result === 0) {
			image = response.data.image
			use_width = response.data.use_width
			use_height = response.data.use_height
			console.log("response image", response.data.image)
		}
		else {
			console.log('cannot get gen info from exodus . ', response.data.result, response.data.message)
			return;
		}
		console.log("load data for position tracking : ", image, use_width, use_height)

		const groupname = group_id
		const percent = (use_width * use_height) / (3840 * 2160) * 100
		const strmessage = `Group : ${groupname} \n Input Image : ${image} \n Use width : ${use_width} px \n Use height : ${use_height} px\n Usage % : ${percent.toFixed(2)} %`
		setMessage('')
		setDescription(strmessage)

		const imageUrl = process.env.REACT_APP_SERVER_IMAGE_URL + '/' + task_id + '/' + image;
		console.log('imageUrl', imageUrl)
		setPtImage(imageUrl)
	}

	const ApplyPoints = async () => {

		let response = null;

		const data = {
			job_id: job_id,
			image: ptImage.split('/').slice(-1)[0],
			track_x1: targetPointRef.current[0].x,
			track_y1: targetPointRef.current[0].y,
			track_x2: targetPointRef.current[1].x,
			track_y2: targetPointRef.current[1].y,
			config: configure,
			task_id: task_id,
			group_id: group_id
		}
		console.log("Apply points : ", data)

		try {
			console.log("get geninfo job : ", job_id)
			response = await axios.post(process.env.REACT_APP_SERVER_URL + `/api/position_tracking`, data);
		} catch (err) {
			console.log(err);
			return;
		}

		if (response && response.data.result === 0) {
			console.log("response position tracking", response.data.image)
		}
		else {
			console.log('cannot get gen info from exodus . ', response.data.result, response.data.message)
			return;
		}

		clearPoints();
	}

	const initContext = () => {
		context = canvasRef.current.getContext('2d')
		canvasRef.current.addEventListener('mousedown', (event) => onMouseDown(event, context), { passive: false });
		canvasRef.current.addEventListener('mouseup', (event) => onMouseUp(event, context), { passive: false });
		canvasRef.current.addEventListener('mousemove', (event) => onMouseMove(event, context), { passive: false });
		canvasRef.current.addEventListener('wheel', (event) => onWheel(event, context), { passive: false });
		canvasRef.current.addEventListener('contextmenu', (event) => onRightClick(event, context), { passive: false });

		context.save();
		context.clearRect(0, 0, canvas.current.width, canvas.current.height);
		context.restore();
		context.scale(0.32, 0.32);
		context.drawImage(image.current, 0, 0, imageWidth, imageHeight);

	}
	useEffect(() => {
		loadData(request_id);
	}, [])

	return (
		<>
			<div>
				<p id="task-title" ><img src='./asset/pin.png' width="20px" alt="" />  Generated Request : {request_id}</p>
				<Row>
					<div className="modebtn-message2">
						<span >{description}</span>
					</div>
				</Row>
				{/* <Row>
					<div className="modebtn-message">
						<span >{message}</span>
					</div>
				</Row> */}
				<Button
					className="modebtn-ptApply"
					size="sm"
					variant="primary"
					id='apply'
					as="input"
					type='button'
					value="Apply"
					onClick={ApplyPoints}
					disabled={ptInputDone === false}
				>
				</Button>

			</div>
			<div className='canvas-wrapper' >
				<Form.Group>
					<img
						id='image'
						ref={imageRef}
						src={ptImage}
						onLoad={(e) => initContext()}
						hidden={true}
					/>
					<canvas
						id='canvas-left'
						ref={canvasRef}
						width={canvasWidth}
						height={canvasHeight}
					>
					</canvas>
					<div
						id='mouse-pos-left'
						ref={mousePosRef}
					/>
					<div
						id='target-left'
						ref={targetInfoRef}
					/>
				</Form.Group>
			</div>
		</>
	)

}