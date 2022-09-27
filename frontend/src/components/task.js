import React, { component, useEffect, useState, useRef, Fragment } from 'react';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup';
import Table from 'react-bootstrap/Table';
import Modal from 'react-bootstrap/Modal';
import '../css/task.css';
import { saveAs } from 'file-saver';

const calculate = async (taskId, taskPath, groupId) => {
    console.log("Calculate click ", groupId);
    console.log("before calculate " + taskId + " " + taskPath);

    const data = {
        taskId: taskId,
        taskPath: taskPath,
        group: groupId
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
        // setJobId(response.data.job_id);
        // setCalState(CAL_STATE.START);
        // setStatusMessage('Calculating...');
        console.log("send calculate. job id : ", response.data.job_id);
    }
}


export const TaskGroupTable = (taskId, taskPath, groupInfo) => {
    console.log("Task start : " + taskId);

    const CAL_STATE = {
        READY: 0,
        START: 1,
        COMPLETE: 2,
        CANCEL: 3,
    }

    const [jobId, setJobId] = useState(0);
    const [show, setShow] = useState(false);
    const [calState, setCalState] = useState(CAL_STATE.READY)
    const [statusMessage, setStatusMessage] = useState('')
    const [downloadInfo, setDownloadInfo] = useState({});

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

    const handleModalClose = () => {
        setShow(false);
    }

    const handleModalCancel = () => {
        setShow(false);
        console.log(`handle modal cancel  ${show}`)
        cancelSend()
    }

    const ShowModal = () => {

        return (
            <Modal className="mymodal" show={show}>
                <Modal.Header closeButton>
                    <Modal.Title>CANCEL WARN!</Modal.Title>
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

    const cancelClick = () => {
        setShow(true);
        console.log(`cancel clicked show : ${show}`)
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
            setCalState(CAL_STATE.CANCEL);
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
            // setCalState(CAL_STATE.CANCEL);
        }

        const onGetPairClick = () => {

        }
        setStatusMessage("IT IS TEST! ");

        return (
            <>
                <Button size="sm"
                    as="input"
                    type='button'
                    value="Status"
                    onClick={onGetStatus}
                    hidden={group.cam_count < 5}
                    disabled={false}>
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
                    disabled={true}>
                </Button>
            </>
        )
    }

    const TaskRowResult = ({ group }) => {
        const onGetResult = () => {

        }

        return (
            <div>
                {/* <InputGroup className="mb-3" id="result-checkbox" hidden={group.cam_count < 5}> */}
                <InputGroup.Checkbox aria-label="check boc" disabled={group.cam_count < 5} />
                {/* </InputGroup> */}
            </div >
        )
    }

    const GroupTable = ({ groups }) => {
        console.log("start GroupTable! ")
        return (
            groups.map((group =>
                <tr key={group.no} >
                    <td> {group.group_id}</td>
                    <td>{group.cam_count}</td>
                    <td id="td-request">
                        <TaskRowRequest group={group}></TaskRowRequest>
                    </td>
                    <td id="td-status">
                        <TaskRowStatus group={group}></TaskRowStatus>
                    </td>
                    <td id="td-result">
                        <TaskRowResult group={group}></TaskRowResult>
                    </td>
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
                <ShowModal />
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
            </Fragment >
        )
    };
};
