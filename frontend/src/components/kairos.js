import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container';

import '../css/App.css';
// import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../css/config.css';
import { CreateTask } from './create_task.js';
import { TaskLibrary } from './task_library.js';

function Kairos(props) {
	const [state, setState] = useState('')
	const [version, setVersion] = useState(' V0.0.0.1 / V0.0.0.1 / kairos V0.0.0.1')
	const [alienTarget, setAlienTarget] = useState('./asset/alien.png')

	const [setfrom, setSetfrom] = useState('None')

	const onHandleCreateTask = () => {
		setState('create')
	};

	const handleDataFrom = (type) => setSetfrom(type);
	const onClickUpload = () => {
		console.log('on click upload')
		setSetfrom('upload')
	};

	const onClickExodus = () => {
		console.log('on click exodus')
		setSetfrom('exodus')
	};


	const onHandlePlayTask = () => {
		setState('play')
	};

	const onHandleAlien = () => {
		console.log('handle alien click')
	};

	const SubContent = () => {
		console.log('sub content ', state, setfrom)

		if (state === 'create' && setfrom === 'None') {
			return (
				<>
					<hr />
				</>
			)
		}
		else if (state === 'create' && setfrom === 'upload') {
			return (
				<>
					<hr />
					<CreateTask from={'kairos'} />
				</>
			)
		}
		else if (state === 'create' && setfrom === 'exodus') {
			return (
				<>
					<hr />
					<TaskLibrary from={'kairos'} />
				</>
			)
		}
	};

	const MainContent = () => {
		if (state === 'create') {
			return (
				<>
					<div style={{ marginLeft: '30px', marginBottom: '30px' }}>
						<Row>
							<Button
								size="sm"
								variant="info"
								id='upload'
								as="input"
								type='button'
								value='UPLOAD ALL'
								style={{ width: '160px' }}
								onClick={onClickUpload}>
							</Button> &nbsp;&nbsp; &nbsp;&nbsp;
							<Button
								size="sm"
								variant="info"
								id='exodus'
								as="input"
								type='button'
								value="FROM EXODUS"
								style={{ width: '160px' }}
								onClick={onClickExodus}>

							</Button>
						</Row>
					</div>
				</>
			)
		}
		else if (state === 'play') {
			return (
				<>
					<TaskLibrary />
				</>
			)
		}
		else if (state === 'alien') {
			console.log("click alien")
			return (
				<>
				</>
			)
		}
	}

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

	useEffect(() => {

	}, [])


	return (
		<div className="App">
			<nav className="navbar navbar-dark bg-dark py-1"
				style={{ height: "10px", width: '100%' }}>
			</nav>
			<Container>
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
								style={{ width: '140px', color: '#FFFFFF', float: 'center' }}
							><img src='/' width='30px' alt='' /> <p></p>
								{''}</Button></Col>
						<Col xs lg='2'>
							<Button className='rounded' variant={state === 'create' ? 'primary' : 'seconday'}
								style={{ width: '140px', color: '#FFFFFF', float: 'center' }}
								onClick={onHandleCreateTask}><img src='./asset/plus.png' width='60px' alt='' /><p></p>
								CREATE</Button> </Col>
						{/* <Col xs lg='2'>
							<Button variant={state === 'search' ? 'primary' : 'seconday'}
								style={{ width: '140px', color: '#FFFFFF', float: 'center' }}
								onClick={onHandleSearchTask}><img src='./asset/search.png' width='60px' alt='' /> <p></p>
								SEARCH </Button></Col> */}
						<Col xs lg='2'>
							<Button variant='no'
								style={{ width: '140px', color: '#FFFFFF', float: 'center' }}
							><img src='/' width='30px' alt='' /> <p></p>
								{''}</Button></Col>
						<Col xs lg='2'>
							<Button variant={state === 'play' ? 'primary' : 'seconday'}
								style={{ width: '140px', color: '#FFFFFF', float: 'center' }}
								onClick={onHandlePlayTask}><img src='./asset/play.png' width='60px' alt='' /> <p></p>
								PLAY</Button></Col>
					</Row>
					<p></p>
					<hr />
					<MainContent />
					<SubContent />
				</Row>
			</Container>
		</div >

	);

}

export default Kairos;
