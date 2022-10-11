import React, { useState, createContext } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './css/App.css';
import AutoCalib from './components/auto_calib';
import TaskLibrary from './components/task_library';
import plus from './asset/plus.png';
import search from './asset/search.png';
import help from './asset/help.png';
import alien from './asset/alien.png';

export const TableDataContext = createContext();
const initial =
  [
    {
      'group_id': 'Group1',
      'cam_count': 0,
      'no': 102,
      'status': 'None',
      'job_id': 2067,
      'gen_job_id': 2030
    },
    {
      'group_id': 'Group2',
      'cam_count': 0,
      'no': 103,
      'status': 'None',
      'job_id': 2068,
      'gen_job_id': 2030
    }
  ];

function App(props) {
  const [state, setState] = useState('')
  const [isHover, setIsHover] = useState('')
  const [groupInfo, setGroupInfo] = useState(initial);

  const changeTableData = async (type, params) => {
    console.log('chage table data : ', type, params)
    if (type === 'addJobid') {
      const groupNo = params[0]
      const jobid = params[1]
      console.log(`changeTableData is called with ${groupNo}, ${jobid}`)
      for (const group of groupInfo.groups) {
        if (group.no === groupNo) {
          group["job_id"] = jobid;
          console.log("changeTableData modify the jobid of group.. " + jobid)
          break;
        }
      }
    } else if (type === 'reset') {
      console.log('reset called task_id:', params[0]);
      // const taskId = params[0]
      // try {
      //     const group = await getGroupInfo(taskId);
      //     for (const g of group) {
      //         g["status"] = '';
      //     }
      //     setGroupInfo(group);
      // } catch (err) {
      //     console.log("change Table  data reset err ", err);
      // }
      setGroupInfo(params[0])
    }
  }

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

  const handleMouseEnter = () => {
    setIsHover(true)
  }
  const handleMouseLeave = () => {
    setIsHover(false)
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
    else {
      return (
        <>

        </>
      )
    }
  }

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
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{ height: '70%', width: '240px', cursor: isHover ? 'pointer' : 'hand' }}
              /> </Col>
            <Col xs lg="3"><h3>Auto-Calibration</h3> </Col>
          </Row>
          <hr />
          <Row className="justify-content-md-center">
            <Col xs lg='2'>
              <Button className="rounded" variant={state === "create" ? "primary" : "seconday"}
                style={{ width: '140px', color: '#FFFFFF', float: 'center' }}
                onClick={onHandleCreateTask}><img src={plus} width="80px" alt="" /><p></p>
                Create Task</Button> </Col>
            <Col xs lg='2'>
              <Button variant={state === "search" ? "primary" : "seconday"}
                style={{ width: '140px', color: '#FFFFFF', float: 'center' }}
                onClick={onHandleSearchTask}><img src={search} width="80px" alt="" /> <p></p>
                Search Task</Button></Col>
            <Col xs lg='2'>
              <Button variant={state === "guide" ? "primary" : "seconday"}
                style={{ width: '140px', color: '#FFFFFF', float: 'center' }}
                onClick={onHandleGuide}><img src={help} width="80px" alt="" /> <p></p>
                Guide</Button></Col>
            <Col xs lg='2'>
              <Button variant={state === "alien" ? "primary" : "seconday"}
                style={{ width: '140px', color: '#FF0000', float: 'center' }}
                onClick={onHandleAlien}><img src={alien} width="80px" alt="" /> <p></p>
                BackDoor</Button></Col>

          </Row>
          <p></p>
          <hr />
          <TableDataContext.Provider value={{ groupInfo, changeTableData }}>
            <MainContent /></TableDataContext.Provider>
          {/* <AutoCalib disabled={state === 'search'} /> */}
        </Row>
      </Container>
    </div >

  );
}
export default App;