import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';

import { commonData } from '../App.js';
import { PopupMessage } from './popup.js';

import '../css/task_library.css';


export const TaskTrackerInfomap = ({ from, callback }) => {

	let index = 0;

	const { common, changeCommon } = useContext(commonData)
	const [mapLoaded, setMapLoaded] = useState(false);
	const [trackerTaskId, setTrackerTaskId] = useState(common.trackerTaskId);
	const [infoMap, setInfoMap] = useState(common.trackerInfoMap);

	console.log('tracker infomap draw', trackerTaskId, infoMap)

	useEffect(() => {
		console.log("uese effect is called? ")
		if (trackerTaskId !== '' && trackerTaskId !== null) {
			callback('change_step3_from_tracker')
		}

	}, [infoMap, trackerTaskId])


	const TaskTrackerInfomapTable = () => {
		return (
			Object.keys(infoMap).map(key => {
				const item = infoMap[key];
				console.log(index, key, item)
				index = index + 1;

				return (
					<tr key={key}>
						<td>{index}</td>
						<td>{key} </td>
						<td>{item.group}</td>
						<td>{item.tracker_url}</td>
						<td>{item.stream_url}</td>
					</tr>
				);
			})

		)
	}

	return (
		<>
			<div className='table-container2' hidden={trackerTaskId === '' || trackerTaskId === null}>
				<p id="task-title" ><img src='./asset/checkbox.png' width="20px" alt="" />  TASK : {trackerTaskId}</p>
				<Table id="table-body" striped bordered variant="dark">
					<thead>
						<tr>
							<th id="th-no">NO</th>
							<th id="th-status">CAMERA ID</th>
							<th id="th-status">GROUP</th>
							<th id="th-date">TRACKER URL</th>
							<th id="th-date">STREAM URL</th>
						</tr>
					</thead>
					<tbody>
						<TaskTrackerInfomapTable />
					</tbody>
				</Table>
			</div>
		</>
	)
}


export const TaskTrackerHistory = ({ from, callback }) => {

	const { common, changeCommon } = useContext(commonData)

	const today = new Date();
	let fromdate = new Date()
	fromdate.setDate(today.getDate() - 7);
	const todate = today.toLocaleDateString();
	const daterange = fromdate.toLocaleDateString() + ' - ' + todate

	const [tasks, setTasks] = useState('');
	const [tasksLoaded, setTasksLoaded] = useState(false);
	const [trackerTaskId, setTrackerTaskId] = useState('');
	const [infoMap, setInfoMap] = useState({});
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleCloseModal = () => {
		setIsModalOpen(false);
	};

	const handleOpenModal = () => {
		setIsModalOpen(true);
	};

	const onHandleRowClick = async (tr_taskId, taskId, kairos_taskId) => {
		console.log("tracker history table row is clicked ", tr_taskId, taskId, kairos_taskId)
		if (kairos_taskId !== null) {
			getTrackerInfoMap(tr_taskId)
		}
		else {
			setInfoMap({})
			setTrackerTaskId('')
			changeCommon({ trackerTaskId: '' })
			callback('change_step2_from_tracker_none')
			handleOpenModal()
		}

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
			console.log('get tracker tasks response', response.data.task_array);
			setTasks(response.data.task_array)
			setTasksLoaded(true)
		}
	}

	const getTrackerInfoMap = async (taskId) => {

		let response = null;
		try {
			response = await axios.get(process.env.REACT_APP_SERVER_URL + `/control/get_trackerinfomap/${taskId}`);
		}
		catch (err) {
			console.log(err)
		}

		if (response && response.data) {
			console.log('get tracker info response', response.data.tracker_info);
			setTrackerTaskId(taskId)
			changeCommon({ trackerTaskId: taskId })
			changeCommon({ trackerInfoMap: response.data.tracker_info })
			callback('change_step2_from_tracker')
		}
		else {
			setInfoMap({})
			setTrackerTaskId('')
			changeCommon({ trackerTaskId: '' })
			callback('change_step2_from_tracker_none')
			handleOpenModal()
		}
	}

	if (tasksLoaded === false) {
		getTasks()
	}

	const TaskTrackerHistoryRecords = () => {

		return (
			tasks.map((task, index) => (
				<tr key={task.tracker_task_id} onClick={() => onHandleRowClick(task.tracker_task_id, task.task_id, task.kairos_task_id)} >
					<td> {index + 1}</td>
					<td> {task.tracker_task_id}</td>
					<td> {task.createdate}</td>
					<td> {task.task_id}</td>
					<td> {task.command_status}</td>
					<td> {task.run_status}</td>
				</tr >
			))
		);
	};

	if (tasksLoaded === true) {
		return (
			<>
				<div className='table-container1'>
					<PopupMessage show={isModalOpen}
						handleClose={handleCloseModal}
						title="WARNING"
						content={<p>This task is not available for visualization.</p>} />
					<p id="task-title" ><img src='./asset/checkbox.png' width="20px" alt="" />  TASK LIST : {daterange}</p>
					<Table id="table-body" striped bordered variant="dark">
						<thead>
							<tr>
								<th id="th-no">NO</th>
								<th id="th-date">TRACKER NAME</th>
								<th id="th-date">CREATE DATE</th>
								<th id="th-date">TASK ID</th>
								<th id="th-status">COMMAND</th>
								<th id="th-status">STATUS</th>
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