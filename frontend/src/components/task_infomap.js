import React, { useState, Fragment, useEffect, useContext } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup';
import Table from 'react-bootstrap/Table';

import '../css/task_unity.css';

import { commonData } from '../App';

export const TaskInfoMap = ({ taskId, selectedList }) => {
    console.log("Task Info map ", taskId, selectedList);
    const { common, changeCommon } = useContext(commonData)


    const InfoMapTable = () => {
        return (
            <>
            </>
        )
    }


    return (
        <>
            <div id="button-row-down" >
                <Button
                    size="sm"
                    variant="primary"
                    className="item-btn-wrapper"
                    id='result'
                    as="input"
                    type='button'
                    value="Apply"
                // onClick={downloadResult}
                >
                </Button>
            </div>

            <div className='table-container'>
                <Table id="table-body" striped bordered variant="dark">
                    <thead>
                        <tr>
                            <th id="th-no">No</th>
                            <th id="th-name">Camera</th>
                            <th id="th-group">Group</th>
                            <th id="th-ip">Camera IP</th>
                            <th id="th-tracker">Tracker</th>
                            <th id="th-apply">Apply</th>
                            <th id="th-status">Statu</th>
                        </tr>
                    </thead>
                    <tbody>
                        <InfoMapTable />
                    </tbody>
                </Table>
            </div>
        </>
    )
};
