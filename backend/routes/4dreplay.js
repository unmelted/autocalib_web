require("dotenv").config();
let express = require('express'),
	router = express.Router();
const request = require('request');
const axios = require('axios');
const path = require("path");
const handler = require('../db/handler.js')
const taskManager = require('../control/task.js');

router.post('/send_url', async (req, res) => {

	console.log("send url api start..  ")


});

module.exports = router;
