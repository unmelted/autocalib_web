import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button'
import Badge from 'react-bootstrap/Badge';

import '../css/App.css';
import '../css/config.css';

import { commonData } from '../App';
import { configData } from '../App.js';
import { CreateTask } from './create_task.js';
import { TaskGroupTable } from './task_group.js'
import { TaskHistory } from './task_history.js';
import { TaskRequestHistory } from './task_requests.js';
import { Canvas } from './canvas.js';
import { ReviewGallery } from './gallery.js'

import Config from './config';


function Exodus(props) {
    const [step0, setStep0] = useState('both'); // none | both |  create  | search | guide
    const [step1, setStep1] = useState('both'); // none | ecah | upload | task history
    const [step2, setStep2] = useState('none'); //none | task request history | task group
    const [step3, setStep3] = useState('none'); //none | canvas
    const [step4, setStep4] = useState('none'); //none | review
    const [redraw, setRedraw] = useState(0);
    const { common, changeCommon } = useContext(commonData)
    const { configure, changeConfigure } = useContext(configData)

    const callback = (status) => {
        console.log("change callback :  ", status)

        if (status === 'change_step2_from_create_exodus') {
            setStep2('task_group')
        }
        else if (status === 'change_step2') {
            if (step2 === 'task_request_history') {
                setRedraw(prevRedraw => prevRedraw + 1);
            }
            setStep2('task_request_history')
        }
        else if (status === 'change_step3') {
            setStep3('canvas')
        }
        else if (status === 'change_step3_canvas_submit') {
            setStep3('none')
        }
        else if (status === 'change_step3_review') {
            setStep4('review')
        }
        else if (status === 'change_step4_review_done') {
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
        }
    };

    useEffect(() => {

    }, [redraw])


    const Step0_Module = () => {

        const [version, setVersion] = useState(' V0.0.0.1 / V0.0.0.1 / kairos V0.0.0.1')
        const [alienTarget, setAlienTarget] = useState('./asset/alien.png')
        const guideFile = process.env.REACT_APP_SERVER_GUIDE + process.env.REACT_APP_VERSION + '.pdf';

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

        const onHandleAlien = () => {

            if (configure.labatory === 'false') {
                configure.labatory = 'true'
                setAlienTarget('./asset/alien_p.png')
            } else {
                configure.labatory = 'false'
                setAlienTarget('./asset/alien.png')
            }
        };

        return (
            <>
                <Row>
                    <Row>
                        <Col><h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>EXODUS</h2> </Col>
                        <Col xs align='right'> <Badge bg="primary" style={{ width: '80px' }}>VERSION </Badge>  {version}</Col>
                    </Row>
                    <Row>
                        <Col xs align='right'> <Badge bg="dark" onClick={onHandleAlien} style={{ width: '80px' }}>LAB </Badge> <img src={alienTarget} width="20px" alt="" /></Col>
                    </Row>
                    <p></p>
                    <hr />
                    <Row className="justify-content-md-center">
                        <Col xs lg='2'>
                            <Button className="rounded" variant={step0 === "create" ? "primary" : "seconday"}
                                style={{ width: '140px', color: '#FFFFFF', float: 'center' }}
                                onClick={() => { initStep(0); setStep0('create') }}><img src='./asset/plus.png' width="60px" alt="" /><p></p>
                                CREATE </Button> </Col>
                        <Col xs lg='2'>
                            <Button variant={step0 === "search" ? "primary" : "seconday"}
                                style={{ width: '140px', color: '#FFFFFF', float: 'center' }}
                                onClick={() => { initStep(0); setStep0('search') }}><img src='./asset/search.png' width="60px" alt="" /> <p></p>
                                SEARCH </Button></Col>
                        <Col xs lg='2'>
                            <Button variant='no'
                                style={{ width: '140px', color: '#FFFFFF', float: 'center' }}
                            ><img src='/' width='30px' alt='' /> <p></p>
                                {''}</Button></Col>
                        <Col xs lg='2'>
                            <Button variant={step0 === "guide" ? "primary" : "seconday"}
                                style={{ width: '140px', color: '#FFFFFF', float: 'center' }}>
                                <a href={guideFile} target="_blank"><img src='./asset/help.png' width="60px" alt="" /></a> <p></p>
                                GUIDE </Button></Col>
                    </Row>
                    <p></p>
                    <hr />
                </Row>
            </>
        );
    }

    const Step1_Module = () => {

        if (step0 === 'create') {
            return (
                <>
                    <CreateTask from={'exodus'} callback={callback} />
                </>
            )
        }
        else if (step0 === 'search') {
            return (
                <>
                    <TaskHistory from={'exodus'} callback={callback} />
                </>
            )
        }
        else {
            return (
                <></>
            )
        }
    };

    const Step2_Module = () => {
        console.log("Step2_module : ", step2)

        if (step2 === 'task_group') {
            return (
                <>
                    <TaskGroupTable from={'exodus'} callback={callback} />
                </>
            )
        }
        else if (step2 === 'task_request_history') {
            return (
                <>
                    <TaskRequestHistory from={'exodus'} callback={callback} />
                </>
            )
        } else {
            return (
                <></>
            )
        }
    }

    const Step3_Module = () => {
        if (step3 === 'canvas') {
            return (
                <>
                    <Canvas from={'exodus'} callback={callback} />
                </>
            )
        }
        else {
            return (
                <>
                </>)
        }
    }

    const Step4_Module = () => {
        if (step4 === 'review') {
            return (
                <>
                    <ReviewGallery from={'exodus'} callback={callback} />
                </>
            )
        }
    }
    // useEffect(() => {

    // }, [step2])

    return (
        <>
            <div className='App'>
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
}

export default React.memo(Exodus);