import React, { component, useEffect, useState, useRef } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button'
import Table from 'react-bootstrap/Table';
import '../css/task.css';

const groupInfo = [
    {
        no: "2",
        taskId: "20220922",
        group_id: 'Group1',
        cam_count: 56
    },
    {
        no: "3",
        taskId: "20220922",
        group_id: 'Group2',
        cam_count: 3
    }];

const CAL_STATE = {
    READY: 0,
    START: 1,
    COMPLETE: 2,
    CANCEL: 3,
}


const TaskRowRequest = ({ group }) => {
    const [calState, setCalState] = useState(CAL_STATE.READY)
    const onCalculateClick = () => {
        setCalState(CAL_STATE.START);
    }
    const onCancelClick = () => {
        setCalState(CAL_STATE.CANCEL);
    }
    const onGetPairClick = () => {

    }

    return (
        <div>
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
            <Button size="sm"
                as="input"
                type='button'
                variant="success"
                value="Pick Point"
                onClick={onGetPairClick}
                hidden={group.cam_count < 5}
                disabled={calState !== CAL_STATE.COMPLETE}>
            </Button>
        </div>

    )
}

const GroupTable = ({ groupInfo2 }) => {
    console.log("start GroupTable! ")
    return (
        groupInfo.map((group =>
            <tr key={group.no} >
                <td> {group.group_id}</td>
                <td>{group.cam_count}</td>
                <td id="td-request">
                    <TaskRowRequest group={group}></TaskRowRequest>
                </td>
                <td>-</td>
                <td>-</td>
            </tr >
        )
        ));
};

export const Task = ({ taskId, groupInfo }) => {

    return (
        <div
            style={{
                border: '1px solid gray',
                marginTop: '15px',
            }}
        >
            <div className='table-container'>
                <p id="task-title" > CURRENT TASK ID : {taskId} </p>
                <Table id="table-body" striped bordered variant="dark">
                    <thead>
                        <tr>
                            <th id="th-name">Group Name</th>
                            <th id="th-count">Camera Count</th>
                            <th id="th-request">Request</th>
                            <th id="th-status">Status</th>
                            <th id="th-status">Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        <GroupTable id="grou-row" groupInfo={groupInfo}></GroupTable>
                    </tbody>
                </Table>
            </div>
        </div >
    )
};
