import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button'
import Badge from 'react-bootstrap/Badge';

import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './css/App.css';
import AutoCalib from './components/auto_calib';
import TaskLibrary from './components/task_library';

import plus from './asset/plus.png';
import search from './asset/search.png';
import help from './asset/help.png';
import alien from './asset/alien.png';

function App(props) {
  const [state, setState] = useState('')
  const [isHover, setIsHover] = useState('')
  const guideFile = process.env.REACT_APP_SERVER_GUIDE + process.env.REACT_APP_VERSION + '.pdf';

  const onHandleCreateTask = () => {
    setState('create')
  };

  const onHandleSearchTask = () => {
    setState('search')
  };

  const onHandleGuide = () => {
    setState('guide')
  };

  const onHandleAlien = () => {
    setState('alien')
  };

  const onHandleHome = () => {
    setState('')
  }

  const MainContent = () => {
    if (state === 'create') {
      return (
        <>
          <AutoCalib />
        </>
      )
    }
    else if (state === 'search') {
      return (
        <>
          <TaskLibrary />
        </>
      )
    }
    else if (state === 'guide') {
      // console.log('guide file name : ', guideFile)
      return (
        <>
        </>
      )
    }
    else if (state === 'alien') {
      return (
        <>
        </>
      )
    }
  }

  console.log(process.env.REACT_APP_VERSION)


  return (
    <div className="App">
      <nav className="navbar navbar-dark bg-dark py-3"
        style={{ height: "30px" }}>
      </nav>
      <Container>
        <Row>
          <Row id="upper-row1">
            <p></p>
            <Col xs lg="2">
              <img
                src="https://4dreplay.com/4d/wp-content/uploads/2021/10/logo_white-2.png"
                alt="Logo"
                onClick={onHandleHome}
                style={{ height: '70%', width: '240px', cursor: isHover ? 'pointer' : 'hand' }}
              /> </Col>
            <Col xs lg="3"><h3>Auto-Calibration</h3> </Col>
          </Row>
          <Row>
            <Col xs align='right'> <Badge bg="primary" style={{ width: '80px' }}>VERSION </Badge> {process.env.REACT_APP_VERSION} / {process.env.REACT_APP_VERSION} / EXODUS {process.env.REACT_APP_VERSION}</Col>
          </Row>
          <p></p>
          <hr />
          <Row className="justify-content-md-center">
            <Col xs lg='2'>
              <Button className="rounded" variant={state === "create" ? "primary" : "seconday"}
                style={{ width: '140px', color: '#FFFFFF', float: 'center' }}
                onClick={onHandleCreateTask}><img src={plus} width="60px" alt="" /><p></p>
                Create Task</Button> </Col>
            <Col xs lg='2'>
              <Button variant={state === "search" ? "primary" : "seconday"}
                style={{ width: '140px', color: '#FFFFFF', float: 'center' }}
                onClick={onHandleSearchTask}><img src={search} width="60px" alt="" /> <p></p>
                Search Task</Button></Col>
            <Col xs lg='2'>
              <Button variant={state === "guide" ? "primary" : "seconday"}
                style={{ width: '140px', color: '#FFFFFF', float: 'center' }}>
                <a href={guideFile} target="_blank"><img src={help} width="60px" alt="" /></a> <p></p>
                Guide</Button></Col>
            <Col xs lg='2'>
              <Button variant={state === "alien" ? "primary" : "seconday"}
                style={{ width: '140px', color: '#FF0000', float: 'center' }}
                onClick={onHandleAlien}><img src={alien} width="60px" alt="" /> <p></p>
                BackDoor</Button></Col>

          </Row>
          <p></p>
          <hr />
          <MainContent />
          {/* <AutoCalib disabled={state === 'search'} /> */}
        </Row>
      </Container>
    </div >

  );
}
export default App;