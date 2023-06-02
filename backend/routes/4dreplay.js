require("dotenv").config();
const util = require('util');
let express = require('express'),
	router = express.Router();
const request = require('request');
const axios = require('axios');
const path = require("path");

const handler = require('../db/handler.js')
const taskManager = require('../control/task.js');


router.post('/send_images', async (req, res, next) => {

	console.log("send images..  ")

	const imageDir = process.env.AUTO_CALIB_DIR;
	let taskNo = 0;
	let taskId = 0;
	[taskNo, taskId, fullPath] = await taskManager.createNewTask()

	if (taskNo == -1) {
		res.status(500).json({})
	}

	const upload = taskManager.upload_images(fullPath);
	upload.array('imgCollection', 1000);
	const uploadObj = util.promisify(upload.any());

	try {
		await uploadObj(req, res);
		result = await taskManager.parsingGroupInfo(taskId, fullPath)
	}
	catch (err) {
		console.log('parsing group info reject.. ', err)
		res.status(500).json({})
		return;
	}

	result = await handler.insertNewTask(taskNo, taskId, fullPath)

	if (result < 0) {
		res.status(500).json({})
		return;
	}

	console.log("parsing gourp info result  : ", result);
	if (result === 0) {
		console.log("end parsing groupinfo")
		res.send({
			status: 0,
			message: 'success',
			taskId: taskId,
			taskPath: fullPath,
		});
	} else {
		res.status(500).json({})
	}

});


router.post('/send_url', async (req, res) => {

	console.log("send url api start..  ", req.body)

	try {
		console.log(req.body)

		res.status(200).json({
			message: 'success',
		});

	} catch (err) {
		console.log(err)
		res.status(500).json({})
	}
});

module.exports = router;
