
import React, { useState, useContext } from "react";
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Badge from 'react-bootstrap/Badge';
import '../css/config.css';
import { configData } from '../App.js'

function Home() {
	/*
	const [version, setVersion] = useState(' V0.0.0.1 / V0.0.0.1 / kairos V0.0.0.1')
	const [alienTarget, setAlienTarget] = useState('./asset/alien.png')

	const Notice = () => {

	};

	const Board = () => {

	}

	return (
		<div>
			<nav className="navbar navbar-dark bg-dark"
				style={{ height: "10px" }}>
			</nav>
			<Container>
				<Row>
					<Row>
						<Col xs align='right'><Badge bg='primary' style={{ width: '80px' }}>VERSION </Badge>{version}</Col>
					</Row>
					<Row>
						<Col xs align='right'><Badge bg='dark' style={{ width: '80px' }}>LAB </Badge> <img src={alienTarget} width='20px' alt='' /></Col>
					</Row>
					<p></p>
					<hr />
					<Table id='config-body' striped bordered variant="dark">
						<thead>
							<tr>
								<th className='th-item'>ITEM</th>
								<th className='th-option'>OPTION</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td className='th-item'>
									Reconstruction Scale
								</td>
								<td className='th-option'>
								</td>
							</tr>
						</tbody>
					</Table>
				</Row>
			</Container>
		</div >
	);*/

	const [version, setVersion] = useState(' V0.0.0.1 / V0.0.0.1 / kairos V0.0.0.1')
	const [alienTarget, setAlienTarget] = useState('./asset/alien.png')

	const { configure, changeConfigure } = useContext(configData)
	const [scale, setScale] = useState(configure.scale)
	const [pair, setPair] = useState(configure.pair)
	const [prep, setPrep] = useState(configure.preprocess)
	const [rotationCenter, setRotationCenter] = useState(configure.rotation_center)

	const handleChange_scale = e => {
		console.log('scale handleChange is called ', e.target)
		setScale(e.target.id)
		changeConfigure({ scale: e.target.id })
	}
	const handleChange_rotationCenter = e => {
		setRotationCenter(e.target.id)
		changeConfigure({ rotation_center: e.target.id })
	}

	const handleChange_pair = e => {
		setPair(e.target.id)
		changeConfigure({ pair: e.target.id })
	}
	const handleChange_prep = e => {
		setPrep(e.target.id)
		changeConfigure({ preprocess: e.target.id })
	}

	return (
		<div>
			<nav className="navbar navbar-dark bg-dark"
				style={{ height: "10px" }}>
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
					<Table id='config-body' striped bordered variant="dark">
						<thead>

						</thead>
						<tbody>

							<tr>
								<td className='th-item'>
									Rotation Center
								</td>
								<td className='th-option'>
									<Form.Check
										inline
										label="Index 0 Camera Center"
										type={'radio'}
										id={`zero-cam`}
										onChange={handleChange_rotationCenter}
										checked={rotationCenter === 'zero-cam'}
									/>{' '}
									<Form.Check
										inline
										label="Each Own center - Interpolation"
										type={'radio'}
										id={`each-center`}
										onChange={handleChange_rotationCenter}
										checked={rotationCenter === 'each-center'}
									/>{' '}
									<Form.Check
										inline
										label="Areal center in 3D points"
										type={'radio'}
										id={`3d-center`}
										onChange={handleChange_rotationCenter}
										checked={rotationCenter === '3d-center'}
									/>
								</td>
							</tr>


						</tbody>
					</Table>
				</Row>
			</Container>
		</div>
	)
};

export default Home;