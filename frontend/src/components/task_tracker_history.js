import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button'
import Table from 'react-bootstrap/Table';
import { commonData } from '../App.js'
import '../css/task_library.css';


export const TaskTrackerHistory = ({ from, callback }) => {
	const { common, changeCommon } = useContext(commonData)

	const today = new Date();
	let fromdate = new Date()
	fromdate.setDate(today.getDate() - 7);
	const todate = today.toLocaleDateString();
	const daterange = fromdate.toLocaleDateString() + ' - ' + todate

	const [tasks, setTasks] = useState('');
	const [tasksLoaded, setTasksLoaded] = useState(false);


	const onHandleRowClick = async (taskId, task_path, wherefrom) => {
		console.log("tracker history table row is clicked ", taskId, task_path)
		changeCommon({ trackerTaskId: taskId })

		callback('change_step2')
	}

	const getTasks = async () => {
		let response = null;
		try {
			response = await axios.get(process.env.REACT_APP_SERVER_URL + `/control/get_trackertask`);
		}
		catch (err) {
			console.log(err)
		}

		if (response && response.data.task_array) {
			console.log('gettasks response', response.data.task_array);
			setTasks(response.data.task_array)
			setTasksLoaded(true)
		}
	}

	if (tasksLoaded === false) {
		getTasks();
	}

	const TaskTrackerHistoryRecords = () => {

		return (
			tasks.map((task =>
				<tr key={task.tracker_task_id} onClick={() => onHandleRowClick(task.tracker_task_id, task.task_id, task.kairos_task_id)} >
					<td> {task.tracker_task_id}</td>
					<td> {task.createdate}</td>
					<td>{task.task_id}</td>
					<td></td>
				</tr >
			))
		)
	}

	if (tasksLoaded === true) {
		return (
			<>
				<div className='table-container1'>
					<p id="task-title" ><img src='./asset/checkbox.png' width="20px" alt="" />  TASK LIST : {daterange}</p>
					<Table id="table-body" striped bordered variant="dark">
						<thead>
							<tr>
								<th id="th-id">TRACKER NO</th>
								<th id="th-date">CREATE DATE</th>
								<th id="th-task">TASK ID</th>
								<th id="th-statust">STATUS</th>
							</tr>
						</thead>
						<tbody>
							<TaskTrackerHistoryRecords />
						</tbody>
					</Table>
				</div>
			</>
		);
	} else {
		return (
			<></>
		)
	}
};