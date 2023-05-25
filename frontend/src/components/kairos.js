import React, { useEffect, useState, useContext, memo } from 'react';
import axios from 'axios';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container';

import '../css/App.css';
import '../css/config.css';

import { commonData } from '../App';
import { CreateTask } from './create_task.js';
import { TaskHistory } from './task_history.js';
import { TaskUnityTable } from './task_unity';
import { TaskInfoMap } from './task_infomap';

function Kairos(props) {
	const [step0, setStep0] = useState('both'); // none | both |  create  | play
	const [step1, setStep1] = useState('both'); // none | both | upload | exodus
	const [step2, setStep2] = useState('none'); //none | upload | history
	const [step3, setStep3] = useState('none'); //none | task_id
	const [step4, setStep4] = useState('none'); //none | task_id * imagelist
	const { common, changeCommon } = useContext(commonData)
	const [infoMap, setInfoMap] = useState({});

	const callback = (status) => {
		console.log("change callback :  ", status)
		if (status === 'change_step2') {
			setStep3(common.selectedTaskId)
			setStep4('none')
		}
		else if (status === 'change_step3') {
			const newMap = {};
			let i = 0;
			common.selectedTaskImages.forEach((cam) => {
				newMap[cam] = {
					group: common.selectedTaskGroups[i],
					stream_url: './videos/3082_270_330.mp4',
					tracker_url: '10.82.5.148',
					tracker_status: 'none',
					job_id: 100,
					message: '-',
				};
				i++;
			})
			console.log("initMapdata : ", newMap);

			setInfoMap(newMap);

			setStep3('none')
			setStep4(common.selectedTaskId)
		}
		else if (status === 'change_step4') {

			setStep4('none')
		}
	}

	const initStep = (step) => {
		if (step === 0) {
			setStep1('none')
		}

		if (step === 0 || step === 1) {
			setStep2('none')
			setStep3('none')
			setStep4('none')
		}
	};

	useEffect(() => {

	}, [step3])

	const Step0_Module = () => {
		console.log("step0_module start ")

		const [version, setVersion] = useState(' V0.0.0.1 / V0.0.0.1 / kairos V0.0.0.1')
		const [alienTarget, setAlienTarget] = useState('./asset/alien.png')
		const getVersion = async () => {
			let response = null;
			try {
				response = await axios.get(process.env.REACT_APP_SERVER_URL + `/control/getversion`)
			} catch (err) {
				console.log(err)
			}

			if (response) {
				if (response.data) {
					const exodus_version = response.data.exodus_version;
					const back_version = response.data.back_version;
					console.log(exodus_version, back_version)

					const ver_str = `${process.env.REACT_APP_VERSION}  / ${back_version}  / exodus ${exodus_version}`
					console.log(ver_str)
					setVersion(ver_str)
				}
			}
		}

		return (
			<>
				<Row>
					<Row>
						<Col xs align='right'> <Badge bg='primary' style={{ width: '80px' }}>VERSION </Badge>  {version}</Col>
					</Row>
					<Row>
						<Col xs align='right'> <Badge bg='dark' style={{ width: '80px' }}>LAB </Badge> <img src={alienTarget} width='20px' alt='' /></Col>
					</Row>
					<p></p>
					<hr />
					<Row className='justify-content-md-center'>
						<Col xs lg='2'>
							<Button variant='no'
								style={{ width: '140px', color: '#FFFFFF', float: 'center' }}>
								<img src='/' width='30px' alt='' /> <p></p>
								{''}</Button></Col>
						<Col xs lg='2'>
							<Button className='rounded' variant={step0 === 'create' ? 'primary' : 'seconday'}
								style={{ width: '140px', color: '#FFFFFF', float: 'center' }}
								onClick={() => { initStep(0); setStep0('create'); }}><img src='./asset/plus.png' width='60px' alt='' /><p></p>
								CREATE</Button> </Col>
						<Col xs lg='2'>
							<Button variant='no'
								style={{ width: '140px', color: '#FFFFFF', float: 'center' }}
							><img src='/' width='30px' alt='' /> <p></p>
								{''}</Button></Col>
						<Col xs lg='2'>
							<Button variant={step0 === 'play' ? 'primary' : 'seconday'}
								style={{ width: '140px', color: '#FFFFFF', float: 'center' }}
								onClick={() => { initStep(0); setStep0('play'); }}><img src='./asset/play.png' width='60px' alt='' /> <p></p>
								PLAY</Button></Col>
					</Row>
					<p></p>
					<hr />
				</Row>
			</>
		);
	}

	const Step1_Module = () => {
		console.log("step1_module start ")

		if (step0 === 'create') {
			return (
				<>
					<div >
						<Row style={{ marginLeft: '30px', marginBottom: '30px' }}>
							<Button
								size="sm"
								variant="primary"
								id='upload'
								as="input"
								type='button'
								value='UPLOAD ALL'
								style={{ width: '160px' }}
								onClick={() => { initStep(1); setStep1('upload') }}>
							</Button> &nbsp;&nbsp; &nbsp;&nbsp;
							<Button
								size="sm"
								variant="primary"
								id='exodus'
								as="input"
								type='button'
								value="FROM EXODUS"
								style={{ width: '160px' }}
								onClick={() => { initStep(1); setStep1('exodus') }}>
							</Button>
						</Row>
					</div>
					<hr />
				</>
			)
		}
		else if (step0 === 'play') {
			return (
				<></>
			)
		}
		else {
			return (
				<></>
			)
		}
	};

	const Step2_Module = () => {

		if (step1 === 'upload') {
			return (
				<>
					<CreateTask from={'kairos'} callback={callback} />
				</>
			)
		}
		else if (step1 === 'exodus') {
			return (
				<>
					<TaskHistory from={'kairos'} callback={callback} />
				</>
			)
		}
		else {
			return (
				<></>
			)
		}

	}

	const Step3_Module = () => {
		console.log("step3_module start : ", step3);

		if (step3 !== 'none') {
			return (
				<>
					<TaskUnityTable from={'kairos'} callback={callback} />
				</>
			)
		} else {
			return (<></>)
		}
	}

	const Step4_Module = () => {
		if (step4 !== 'none') {
			return (
				<>
					<TaskInfoMap from={step0} callback={callback} initMap={infoMap} />
				</>
			)
		} else {
			return (<></>)
		}
	}

	return (
		<>
			<div className="App">
				<nav className="navbar navbar-dark bg-dark py-1"
					style={{ height: "10px", width: '100%' }}>
				</nav>
				<Container>
					<Row>
						<Step0_Module />
					</Row>
					<Row>
						<Step1_Module />
					</Row>
					<Row>
						<Step2_Module />
					</Row>
					<Row>
						<Step3_Module />
					</Row>
					<Row>
						<Step4_Module />
					</Row>
				</Container>
			</div>
		</>
	)

};

export default React.memo(Kairos);
