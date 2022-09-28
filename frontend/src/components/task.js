import React, { component, useEffect, useState, useRef, Fragment, createContext, useContext } from 'react';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup';
import Table from 'react-bootstrap/Table';
import Modal from 'react-bootstrap/Modal';
import '../css/task.css';
import { saveAs } from 'file-saver';
// import { PairCanvas } from './canvas.js'
// import { TableDataContext } from './auto_calib';

const TableDataContext = createContext();
const context = useContext(TableDataContext);

const TableDataProvider = ({ children }) => {
    const [data, setData] = useState(''); //define your inital 
    return (
        <TableDataContext.Provider value={{ data, setData }}>
            {children}
        </TableDataContext.Provider>
    )
};

export { TableDataContext, TableDataProvider };

export const TaskGroupTable = (taskId, taskPath, groupInfo) => {
    console.log("Task start : " + taskId);
    let changeValue = 0;

    const REQUEST_CATEGORY = {
        CALCULATE: 1,
        GENERATE: 2,
        GET_RESULT: 3,
    }
    const CAL_STATE = {
        READY: 0,
        START: 1,
        COMPLETE: 2,
        CANCEL: 3,
        PAIR_COMPLETE: 4,
    }

    const [show, setShow] = useState(false);
    const [jobId, setJobId] = useState('')
    const [requestId, setRequestId] = useState('')
    const [calState, setCalState] = useState(CAL_STATE.READY)
    const [statusMessage, setStatusMessage] = useState('')
    const [downloadInfo, setDownloadInfo] = useState({});

    const Canvas = () => {
        return (
            <>
                {/* <PairCanvas
                    hidden={calState !== CAL_STATE.COMPELETE}></PairCanvas> */}
            </>)

    }
    const TaskRow = ({ group }) => {

        const calculate = async (taskId, taskPath, groupId) => {
            console.log("before calculate " + taskId + " " + groupId);

            const data = {
                task_id: taskId,
                task_path: taskPath,
                group_id: groupId
            }

            let response = null;

            try {
                response = await axios.post(process.env.REACT_APP_SERVER_URL + "/api/calculate", data);
            } catch (err) {
                console.log(err);
                // setStatusMessage('Unable to calculate!');
                return;
            }

            if (response && response.data.status === 0) {
                setJobId(response.data.job_id);
                setRequestId(response.data.request_id);
                setCalState(CAL_STATE.START);
                setStatusMessage(`Send Request Calculate. Job id ${jobId}`);
                console.log("send calculate. job id : ", response.data.job_id);
            }
        }

        const cancelSend = async () => {
            console.log("cancel Send is called " + jobId)
            let response = null;

            try {
                response = await axios.delete(process.env.REACT_APP_SERVER_URL + `/api/cancel/${jobId}`);
            } catch (err) {
                console.log(err);
                setStatusMessage('Unable to cancel');
                return;
            }

            if (response && response.data.status === 0) {
                setCalState(CAL_STATE.CANCEL);
                setStatusMessage('Canceled.');
            }
        }

        const getStatusSend = async () => {
            console.log("getStatusSend is called " + jobId);
            let response = null;

            try {
                response = await axios.get(process.env.REACT_APP_SERVER_URL + `/api/calculate/status/${jobId}`)

            } catch (err) {
                console.log(err)
                setStatusMessage(err);
                return;
            }

            if (response && response.data.percent) {
                setStatusMessage(`Processing .. ${response.data.percent}%`);
                if (parseInt(response.data.percenet) === 100) {
                    setCalState(CAL_STATE.COMPLETE);
                }
            }
        }

        const handleModalClose = () => {
            setShow(false);
        }

        const handleModalCancel = () => {
            setShow(false);
            console.log(`handle modal cancel  ${show}`)
            cancelSend()
        }

        useEffect(() => {
            console.log("statusMessage useEffect is called ");
        }, [statusMessage, calState]);

        const ShowModal = ({ groupId }) => {

            return (
                <Modal className="mymodal" show={show}>
                    <Modal.Header closeButton>
                        <Modal.Title>CANCEL WARN! GROUP : {groupId}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Are you sure that cancel this calculation? <br></br><b> can't revert after cancel. </b></Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={handleModalClose}>
                            No, won't cancel.
                        </Button>
                        <Button variant="danger" onClick={handleModalCancel}>
                            Sure. want to Cancel.
                        </Button>
                    </Modal.Footer>
                </Modal>
            );
        }

        const downloadResult = () => {
            saveAs(downloadInfo.url, downloadInfo.name);
            // setIsSubmitted(false);
        }

        const TaskRowRequest = ({ group }) => {

            const onCalculateClick = () => {
                calculate(taskId, taskPath, group.group_id);
                setCalState(CAL_STATE.START);
            }
            const onCancelClick = () => {
                setShow(true);
                console.log(`cancel clicked show : ${show}`)
            }

            return (
                <>
                    <Button size="sm"
                        as="input"
                        type='button'
                        value="Calculate"
                        onClick={onCalculateClick}
                        hidden={group.cam_count < 5}
                        disabled={calState === CAL_STATE.START}>
                    </Button>{' '}
                    <Button size="sm"
                        as="input"
                        type='button'
                        className="btn-danger"
                        value="Cancel"
                        onClick={onCancelClick}
                        hidden={group.cam_count < 5}
                        disabled={calState !== CAL_STATE.START}>
                    </Button>{' '}
                </>

            )
        }

        const TaskRowStatus = ({ group }) => {
            const onGetStatus = () => {
                getStatusSend();
            }

            const onGetPairClick = async () => {
                let response = null;

                try {
                    console.log({ jobId })
                    response = await axios.get(process.env.REACT_APP_SERVER_URL + `/api/image/${jobId}`);
                } catch (err) {
                    console.log(err);
                    setStatusMessage('Unable to get images!');
                    return;
                }

                const imageUrl = process.env.REACT_APP_SERVER_IMAGE_URL + '/' + taskPath + '/';

                if (response && response.data.status === 0) {
                    const imageUrlFirst = imageUrl + response.data.first_image;
                    const imageUrlSecond = imageUrl + response.data.second_image;
                    console.log(imageUrlFirst)
                    console.log(imageUrlSecond)
                    // setLeftImage(imageUrlFirst);
                    // setRightImage(imageUrlSecond);
                    setCalState(CAL_STATE.PAIR_COMPLETE);
                }

            }

            return (
                <>
                    <Button size="sm"
                        as="input"
                        type='button'
                        value="Status"
                        onClick={onGetStatus}
                        hidden={group.cam_count < 5}
                        disabled={calState === CAL_STATE.READY || calState === CAL_STATE.CANCEL}>
                    </Button>{' '}
                    <span class="label label-md label-default">
                        {statusMessage}
                    </span>
                    <Button size="sm"
                        as="input"
                        type='button'
                        variant="success"
                        value="Pick Point"
                        onClick={onGetPairClick}
                        hidden={group.cam_count < 5}
                        disabled={calState !== CAL_STATE.COMPLETE}>
                    </Button>
                </>
            )
        }

        const TaskRowResult = ({ group }) => {
            return (
                <div>
                    <InputGroup.Checkbox aria-label="check boc" disabled={group.cam_count < 5} />
                </div >
            )
        }

        return (
            <>
                <ShowModal groupId={group.group_id} />
                <td id="td-request">
                    <TaskRowRequest group={group}></TaskRowRequest>
                </td>
                <td id="td-status">
                    <TaskRowStatus group={group}></TaskRowStatus>
                </td>
                <td id="td-result">
                    <TaskRowResult group={group}></TaskRowResult>
                </td>
            </>
        )

    }

    const GroupTable = ({ groups }) => {
        console.log("start GroupTable! ")
        return (
            groups.map((group =>
                <tr key={group.no} >
                    <td> {group.group_id}</td>
                    <td>{group.cam_count}</td>
                    <TaskRow group={group}></TaskRow>
                </tr >
            )
            ));
    };

    // task main retrun 
    if (groupInfo.length === 0) {
        console.log("groupInfo length is 0! ");
        return (<div />)
    }
    else {
        console.log("groupInfo length is not 0. ");
        return (
            <Fragment >
                <div className='table-container'>
                    <p id="task-title" > CURRENT TASK ID : {taskId} </p>
                    <Table id="table-body" striped bordered variant="dark">
                        <thead>
                            <tr>
                                <th id="th-name">Group Name</th>
                                <th id="th-count">Camera Count</th>
                                <th id="th-request">Request</th>
                                <th id="th-status">Status</th>
                                <th id="th-result">Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            <GroupTable groups={groupInfo}></GroupTable>
                        </tbody>
                    </Table>
                </div>
                <div className='canvas-container'
                    hidde={calState !== CAL_STATE.PAIR_COMPLETE}>
                    <Canvas></Canvas>
                </div>
            </Fragment >
        )
    };
};
