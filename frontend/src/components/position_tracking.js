
import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form';
import { configData } from '../App.js'
import { getGroundImage } from './util.js'
import '../css/canvas.css';

export const PositionTracking = ({ requestId }) => {

	console.log("position tracking : ", requestId)

	const canvasRef = useRef(null);
	const imageRef = useRef(null);
	const mousePosRef = useRef(null);
	const targetInfoRef = useRef(null);

	const targetPointRef = useRef([]);
	const [calImage, setCalImage] = useState('')
	const [isSubmitted, setIsSubmitted] = useState(false);
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
		console.log(targetPointRef.current.length)
		console.log(maxTargetNum.current)

		if (targetPointRef.current < maxTargetNum.current) {
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


	const DrawGenPoints = () => {

	}

	const drawImageToCanvas = (e) => {
		context = canvasRef.current.getContext('2d')
		context.save();
		context.clearRect(0, 0, canvas.current.width, canvas.current.height);
		context.restore();
		context.scale(0.32, 0.32);
		context.drawImage(image.current, 0, 0, imageWidth, imageHeight);

	}


	const clearPoints = () => {
		targetPointRef.current = [];
		targetInfo.current.innerText = '';
		drawImageToCanvas(null, 'left', true);
	}

	const loadData = async () => {
		let response = null;
		console.log('load data', requestId)

		// try {
		// 	const url = await axios.get(process.env.REACT_APP_SERVER_URL + `/contol/getstatistics/${requestId}`);
		// } catch (err) {
		// 	console.log("loadData err : ", err);
		// 	return
		// }

		// if (response && response.data.cal_image) {
		// 	setCalImage(response.data.cal_image);
		// 	if (response.data.cal_point.length > 0) {
		// 		DrawGenPoints(response.data.cal_point);
		// 	}
		// }

		const count = 40
		const groupname = 'Group1'
		const inputpt = [1, 1, 3]
		const image1 = '01001.jpg'
		const strmessage = `${requestId} camera count : ${count} Group : ${groupname} \n Insert Point : ${inputpt} \n Input Image : ${image1}`
		setMessage('')
		setDescription(strmessage)

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
		loadData(requestId);
	}, [])

	return (
		<>
			<div>
				<p id="task-title" ><img src='./asset/pin.png' width="20px" alt="" />  Request : {requestId}</p>
				<Row>
					<div className="modebtn-message">
						<span >{description}</span>
					</div>
				</Row>
				<Row>
					<div className="modebtn-message">
						<span >{message}</span>
					</div>
				</Row>
			</div>
			<div className='canvas-wrapper' >
				<Form.Group>
					<img
						id='image'
						ref={imageRef}
						src={calImage}
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