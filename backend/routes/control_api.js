require("dotenv").config();
let express = require('express'),
    multer = require('multer'),
    router = express.Router();
const request = require('request');
const path = require("path");
var handler = require('../db/handler.js')


router.post('/addalias', async (req, res) => {

    console.log("add alias is called ");

    try {
        result = await handler.updateTask([req.body.task_alias, req.body.task_id]);
        res.status(200).json({
            message: 'success',
        });

    } catch (err) {
        console.log(err)
        res.status(500).json({})
    }
})


router.get('/gettask', async (req, res) => {

    console.log("gettask is called ");

    try {
        result = await handler.selectDatewithinRange();
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


router.get('/groupinfo/:task_id', async (req, res) => {

    console.log("router groupinfo task id : ", req.params.task_id)

    try {
        result = await handler.getGroupInfo(req.params.task_id)
        console.log("get group info end  : " + result[0].group_id)
        res.status(200).json({
            message: 'success',
            group: result,
        });

    } catch (err) {
        console.log(err)
        res.status(500).json({})
    }
});


module.exports = router;
