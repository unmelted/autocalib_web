import React, { useEffect, useState, createContext } from 'react';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button'
import Badge from 'react-bootstrap/Badge';

import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './css/App.css';
import AutoCalib from './components/auto_calib';
import TaskLibrary from './components/task_library';
import Config from './components/config';


export const configData = createContext();
const initConfigure = {
  scale: 'full',
  pair: 'colmap',
  labatory: 'false',
  preprocess: 'Off'
};

function App(props) {
  const [state, setState] = useState('')
  const [isHover, setIsHover] = useState('')
  const [version, setVersion] = useState('')
  const [alienTarget, setAlienTarget] = useState('./asset/alien.png')
  // const [configure, setConfigure] = userSatate(initConfigure)
  let configure = initConfigure;
  console.log("configure.. ", configure)
  const guideFile = process.env.REACT_APP_SERVER_GUIDE + process.env.REACT_APP_VERSION + '.pdf';

  const changeConfigure = (params) => {
    const keys = Object.keys(configure)
    const pkeys = Object.keys(params)

    for (const key of keys) {
      for (const pkey of pkeys) {
        if (key === pkey) {
          console.log("change Config : ", key, pkey)
          configure[key] = params[pkey]
          console.log("change Config result : ", configure[key])
        }
      }
    }
  };

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
    console.log('handle alien click')
    if (configure.labatory === 'false') {
      configure.labatory = 'true'
      setAlienTarget('./asset/alien_p.png')
    } else {
      configure.labatory = 'false'
      setAlienTarget('./asset/alien.png')
    }
  };

  const onHandleHome = () => {
    setState('')
  }

  const onHandleConfig = () => {
    setState('config')
  }

  const MainContent = () => {
    if (state === 'create') {
      return (
        <>
          <configData.Provider value={{ configure, changeConfigure }} >
            <AutoCalib />
          </configData.Provider>
        </>
      )
    }
    else if (state === 'search') {
      return (
        <>
          <configData.Provider value={{ configure, changeConfigure }} >
            <TaskLibrary />
          </configData.Provider>
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
    else if (state === 'config') {
      return (
        <>
          <configData.Provider value={{ configure, changeConfigure }} >
            <Config />
          </configData.Provider>
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
    getVersion()
    console.log('useeffect', alienTarget)
  }, [])

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
            <Col xs align='right'> <Badge bg="primary" style={{ width: '80px' }}>VERSION </Badge>  {version}</Col>
          </Row>
          <Row>
            <Col xs align='right'> <Badge bg="dark" onClick={onHandleAlien} style={{ width: '80px' }}>LAB </Badge> <img src={alienTarget} width="20px" alt="" /></Col>
          </Row>
          <p></p>
          <hr />
          <Row className="justify-content-md-center">
            <Col xs lg='2'>
              <Button className="rounded" variant={state === "create" ? "primary" : "seconday"}
                style={{ width: '140px', color: '#FFFFFF', float: 'center' }}
                onClick={onHandleCreateTask}><img src='./asset/plus.png' width="60px" alt="" /><p></p>
                Create Task</Button> </Col>
            <Col xs lg='2'>
              <Button variant={state === "search" ? "primary" : "seconday"}
                style={{ width: '140px', color: '#FFFFFF', float: 'center' }}
                onClick={onHandleSearchTask}><img src='./asset/search.png' width="60px" alt="" /> <p></p>
                Search Task</Button></Col>
            <Col xs lg='2'>
              <Button variant={state === "config" ? "primary" : "seconday"}
                style={{ width: '140px', color: '#FFFFFF', float: 'center' }}
                onClick={onHandleConfig}><img src='./asset/config.png' width="60px" alt="" /> <p></p>
                Config</Button></Col>
            <Col xs lg='2'>
              <Button variant={state === "guide" ? "primary" : "seconday"}
                style={{ width: '140px', color: '#FFFFFF', float: 'center' }}>
                <a href={guideFile} target="_blank"><img src='./asset/help.png' width="60px" alt="" /></a> <p></p>
                Guide</Button></Col>
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