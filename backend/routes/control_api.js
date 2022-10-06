require("dotenv").config();
let express = require('express'),
    multer = require('multer'),
    router = express.Router();
const request = require('request');
const path = require("path");
var handler = require('../db/handler.js')


router.get('/gettask', async (req, res) => {

    console.log("gettask is called ");

    try {
        result = await handler.selectDatewithinMonth();
        res.status(200).json({
            message: 'success',
            task_array: result,
        });

    } catch (err) {
        console.log(err)
        res.status(500).json({})
    }
})

router.get('/getrequest/:task_id', async (req, res) => {

    console.log("getrequest is called ", req.params.task_id);

    try {
        result = await handler.selectRequestbyTaskId(req.params.task_id);
        console.log("get request  : " + result[0].request_id)
        res.status(200).json({
            message: 'success',
            request_array: result,
        });

    } catch (err) {
        console.log(err)
        res.status(500).json({})
    }
})

module.exports = router;
