import React, { useEffect, useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container';

import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
// import '../css/App.css';

function Kairos(props) {
	const [state, setState] = useState('')
	const [version, setVersion] = useState(' V0.0.0.1 / V0.0.0.1 / kairos V0.0.0.1')
	const [alienTarget, setAlienTarget] = useState('./asset/alien.png')
	// return (
	// 	<div >
	// 		<nav className="navbar navbar-dark bg-dark py-3"
	// 			style={{ height: "20px" }}>
	// 		</nav>
	// 		<Container>
	// 			<Row>
	// 				<Row>
	// 					<Col xs align='right'> <Badge bg="primary" style={{ width: '80px' }}>VERSION </Badge>  {version}</Col>
	// 				</Row>
	// 				<p></p>
	// 				<hr />
	// 				<Row className="justify-content-md-center">
	// 					<Col xs lg='2'>
	// 						<Button className="rounded" variant={state === "create" ? "primary" : "seconday"}
	// 							style={{ width: '140px', color: '#FFFFFF', float: 'center' }}
	// 						><img src='./asset/plus.png' width="60px" alt="" /><p></p>
	// 							Create Task</Button> </Col>
	// 					<Col xs lg='2'>
	// 						<Button variant={state === "search" ? "primary" : "seconday"}
	// 							style={{ width: '140px', color: '#FFFFFF', float: 'center' }}
	// 						><img src='./asset/search.png' width="60px" alt="" /> <p></p>
	// 							Search Task</Button></Col>
	// 					<Col xs lg='2'>
	// 						<Button variant={state === "config" ? "primary" : "seconday"}
	// 							style={{ width: '140px', color: '#FFFFFF', float: 'center' }}
	// 						><img src='./asset/config.png' width="60px" alt="" /> <p></p>
	// 							Config</Button></Col>
	// 					<Col xs lg='2'>
	// 						<Button variant={state === "guide" ? "primary" : "seconday"}
	// 							style={{ width: '140px', color: '#FFFFFF', float: 'center' }}>
	// 							<a href={'/'} target="_blank"><img src='./asset/help.png' width="60px" alt="" /></a> <p></p>
	// 							Guide</Button></Col>
	// 				</Row>
	// 				<p></p>
	// 				<hr />
	// 			</Row>
	// 		</Container>
	// 	</div >

	// );

	return (
		<div className="App">
			<nav className="navbar navbar-dark bg-dark py-3"
				style={{ height: "20px", width: '100%' }}>
			</nav>
			<Container>
				<Row>
					<Row>
						<Col xs align='right'> <Badge bg="primary" style={{ width: '80px' }}>VERSION </Badge>  {version}</Col>
					</Row>
					<Row>
						<Col xs align='right'> <Badge bg="dark" style={{ width: '80px' }}>LAB </Badge> <img src={alienTarget} width="20px" alt="" /></Col>
					</Row>
					<p></p>
					<hr />
					<Row className="justify-content-md-center">
						<Col xs lg='2'>
							<Button className="rounded" variant={state === "create" ? "primary" : "seconday"}
								style={{ width: '140px', color: '#FFFFFF', float: 'center' }}
							><img src='./asset/plus.png' width="40px" alt="" /><p></p>
								Create Task</Button> </Col>
						<Col xs lg='2'>
							<Button variant={state === "search" ? "primary" : "seconday"}
								style={{ width: '140px', color: '#FFFFFF', float: 'center' }}
							><img src='./asset/search.png' width="40px" alt="" /> <p></p>
								Search Task</Button></Col>
						<Col xs lg='2'>
							<Button variant={state === "config" ? "primary" : "seconday"}
								style={{ width: '140px', color: '#FFFFFF', float: 'center' }}
							><img src='./asset/config.png' width="40px" alt="" /> <p></p>
								Config</Button></Col>
						<Col xs lg='2'>
							<Button variant={state === "guide" ? "primary" : "seconday"}
								style={{ width: '140px', color: '#FFFFFF', float: 'center' }}>
								<a href={'/'} target="_blank"><img src='./asset/help.png' width="40px" alt="" /></a> <p></p>
								Guide</Button></Col>
					</Row>
					<p></p>
					<hr />
					{/* <AutoCalib disabled={state === 'search'} /> */}
				</Row>
			</Container>
		</div >

	);

}

export default Kairos;
