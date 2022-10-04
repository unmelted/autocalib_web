import React, { useState, Fragment, useContext } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup';
import Table from 'react-bootstrap/Table';
import '../css/task.css';
import { PairCanvas } from './canvas.js'
import { TableDataContext } from './auto_calib.js';


export const TaskGroupTable = ({ taskId, taskPath }) => {

    const CAL_STATE = {
        READY: 0,
        START: 1,
        COMPLETE: 2,
        CANCEL: 3,
        PAIR_COMPLETE: 4,
    }

    const { groupInfo, changeTableData } = useContext(TableDataContext);
    const [downloadInfo, setDownloadInfo] = useState({});
    const [leftImage, setLeftImage] = useState('');
    const [rightImage, setRightImage] = useState('');
    const [canvasJob, setCanvasJob] = useState('')

    const Canvas = () => {
        if (rightImage !== '' && leftImage !== '') {
            console.log("Canvas is called 1 : " + rightImage)
            console.log("Canvas is called 2 : " + canvasJob)
            return (
                <>
                    <PairCanvas leftImage={leftImage} rightImage={rightImage} jobId={canvasJob[0]} taskId={canvasJob[1]} groupId={canvasJob[2]}></PairCanvas>
                </>)

        }
        else {
            return <></>
        }

    }
    const TaskRow = ({ group }) => {
        const [jobId, setJobId] = useState('')
        const [requestId, setRequestId] = useState('')
        const [calState, setCalState] = useState(CAL_STATE.READY)
        const [statusMessage, setStatusMessage] = useState('')


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
                setStatusMessage(` Unable to calculate! ${err}`);
                return;
            }

            if (response && response.data.status === 0) {
                setJobId(response.data.job_id);
                setRequestId(response.data.request_id);
                setCalState(CAL_STATE.START);
                const strmsg = `Send Request Calculate. Job id ${response.data.job_id}`
                setStatusMessage(strmsg);
                console.log("send calculate. job id : ", response.data.job_id);
                changeTableData(group.no, response.data.job_id);
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
                if (parseInt(response.data.percent) === 100) {
                    setCalState(CAL_STATE.COMPLETE);
                    setStatusMessage(` ${jobId} Done. ${response.data.percent}%`);
                } else {
                    setStatusMessage(` ${jobId} Processing .. ${response.data.percent}%`);
                }
            }
        }

        // const ShowModal = ({ group }) => {
        //     if (show === false) {
        //         return;
        //     } else {
        //         console.log("showmodal group ", group)
        //         console.log("showmodal group ", cancelJob)

        //         return (
        //             <Modal className="mymodal" show={show}>
        //                 <Modal.Header closeButton>
        //                     <Modal.Title>CANCEL WARN! </Modal.Title>
        //                 </Modal.Header>
        //                 <Modal.Body>Are you sure that cancel this calculation? <br></br><b> can't revert after cancel. </b></Modal.Body>
        //                 <Modal.Footer>
        //                     <Button variant="primary" onClick={handleModalClose}>
        //                         No, won't cancel.
        //                     </Button>
        //                     <Button variant="danger" onClick={handleModalCancel}>
        //                         Sure. want to Cancel.
        //                     </Button>
        //                 </Modal.Footer>
        //             </Modal>
        //         );
        //     }
        // }


        const TaskRowRequest = ({ group }) => {
            console.log("taskrow request recieve : ", group);

            const onCalculateClick = () => {
                calculate(taskId, taskPath, group.group_id);
                setCalState(CAL_STATE.START);
            }

            const onCancelClick = async () => {
                console.log("cancle send datacontext 2 : ", group)

                let response = null;

                try {
                    response = await axios.delete(process.env.REACT_APP_SERVER_URL + `/api/cancel/${group['job_id']}`);
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

            return (
                <>
                    {/* <ShowModal group={group} /> */}
                    <Button size="sm"
                        as="input"
                        type='button'
                        value="Calculate"
                        onClick={onCalculateClick}
                        hidden={group.cam_count < 5}
                        disabled={calState !== CAL_STATE.READY}>
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
            console.log("taskrow status recieve : ", group);

            const onGetStatus = () => {
                getStatusSend();
            }

            const onGetPairClick = async () => {
                let response = null;

                try {
                    console.log(group['job_id'])
                    response = await axios.get(process.env.REACT_APP_SERVER_URL + `/api/image/${group['job_id']}`);
                } catch (err) {
                    console.log(err);
                    setStatusMessage('Unable to get images!');
                    return;
                }

                const imageUrl = process.env.REACT_APP_SERVER_IMAGE_URL + '/' + taskId + '/';

                if (response && response.data.status === 0) {
                    const imageUrlFirst = imageUrl + response.data.first_image;
                    const imageUrlSecond = imageUrl + response.data.second_image;
                    console.log(imageUrlFirst)
                    console.log(imageUrlSecond)
                    setLeftImage(imageUrlFirst);
                    setRightImage(imageUrlSecond);
                    setCalState(CAL_STATE.PAIR_COMPLETE);
                    setCanvasJob([jobId, taskId, group.group_id])
                } else {
                    return;
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
                    <span className="label label-md label-default">
                        {statusMessage}
                    </span>
                    <Button size="sm"
                        as="input"
                        type='button'
                        variant="success"
                        value="Pick Point"
                        onClick={onGetPairClick}
                        hidden={group.cam_count < 5}
                    // disabled={calState !== CAL_STATE.COMPLETE && calState !== CAL_STATE.PAIR_COMPLETE}
                    >
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

    const downloadResult = () => {
        // saveAs(downloadInfo.url, downloadInfo.name);
        // setIsSubmitted(false)
        console.log("download result");
    }

    // task main retrun 
    if (groupInfo.length === 0) {
        console.log("groupInfo length is 0! ");
        return (<div />)
    }
    else {
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
                    {/* <Button
                        size="sm"
                        variant="primary"
                        className="item-btn-wrapper"
                        id='result'
                        as="input"
                        type='button'
                        value="DownLoad"
                        onClick={downloadResult}
                        style={{ float: 'right' }}
                    >
                    </Button> */}
                </div>
                <div className='canvas-containe'>
                    <Canvas></Canvas>
                </div>
            </Fragment >
        )
    };
};
