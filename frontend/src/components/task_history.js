import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button'
import Table from 'react-bootstrap/Table';
import { commonData } from '../App.js'
import '../css/task_library.css';


export const TaskHistory = ({ from, callback }) => {
	const { common, changeCommon } = useContext(commonData)

	const today = new Date();
	let fromdate = new Date()
	fromdate.setDate(today.getDate() - 7);
	const todate = today.toLocaleDateString();
	const daterange = fromdate.toLocaleDateString() + ' - ' + todate

	const [tasks, setTasks] = useState('');
	const [tasksLoaded, setTasksLoaded] = useState(false);

	const onHandleHistoryClick = async (taskId) => {
		console.log("onHandleRequest buttoin click", taskId);
		changeCommon({ selectedHistoryId: taskId })
		changeCommon({ leftCanvasImage: '' })
		changeCommon({ leftCanvasImage: '' })

	}

	const onHandleRequestClick = async (taskId, task_path) => {
		console.log("onHandleRequestClck !! ")
		changeCommon({ selectedRequestId: taskId })
		changeCommon({ leftCanvasImage: '' })
		changeCommon({ leftCanvasImage: '' })
	}

	const onHandleRowClick = async (taskId, task_path) => {
		console.log("history table row is clicked ", taskId, task_path)
		changeCommon({ selectedTaskId: taskId })

		callback('change_step2')
	}

	const getTasks = async () => {
		let response = null;
		try {
			response = await axios.get(process.env.REACT_APP_SERVER_URL + `/control/gettask`);
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


	const TaskHistoryRecords = () => {
		return (
			tasks.map((task =>
				<tr key={task.task_no} onClick={() => onHandleRowClick(task.task_id, task.task_path)} >
					<td> {task.task_no}</td>
					<td> {task.task_id}</td>
					<td>{task.createdate}</td>
					<td>{task.alias}</td>
					<td align='left'><Button size='sm'
						as='input'
						type='button'
						variant='warning'
						value='History'
						onClick={() => onHandleHistoryClick(task.task_id)}
						style={{ width: '75px' }}
						hidden={parseInt(task.count) === 0 || from === 'kairos'}>
					</Button>{' '}
						<Button size='sm'
							as='input'
							type='button'
							value='Request'
							onClick={() => onHandleRequestClick(task.task_id, task.task_path)}
							style={{ width: '75px' }}
							hidden={from === 'kairos'}>
						</Button>{' '}
					</td>
				</tr >
			))
		)
	}

	if (tasksLoaded === true) {
		return (
			<>
				<div className='table-container1'>
					<p id="task-title" ><img src='./asset/pin.png' width="20px" alt="" />  TASK LIST : {daterange}</p>
					<Table id="table-body" striped bordered variant="dark">
						<thead>
							<tr>
								<th id="th-no">TASK NO</th>
								<th id="th-id">TASK ID</th>
								<th id="th-date">CREATE DATE</th>
								<th id="th-alias">DESC.</th>
								<th id="th-request">REQUEST</th>
							</tr>
						</thead>
						<tbody>
							<TaskHistoryRecords />
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