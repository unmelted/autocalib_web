require("dotenv").config();
let express = require('express'),
    multer = require('multer'),
    router = express.Router();
const request = require('request');
const axios = require('axios');
const path = require("path");
const handler = require('../db/handler.js')
const taskManager = require('../control/task.js');
const { response } = require("../app.js");

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
        console.log("get request  : " + result[0].job_id)

        for (const row of result) {
            const options = {
                uri: process.env.AUTO_CALIB_EXODUS_URL + '/exodus/autocalib/status/' + row.job_id,
                method: 'GET',
                json: true
            }

            console.log("Call Exodus API // request : " + options.uri);
            request.get(options, async function (err, response, body) {
                if (!err) {
                    console.log("Response: " + JSON.stringify(body));
                    result2 = await handler.updateTaskRequest([body.status, body.result !== null ? body.result : '', body.message, row.job_id], false);
                    console.log(" request // updateTask for status is done ");

                } else {
                    console.log(err)
                    res.status(500).json({})
                }
            });

        }

        result = await handler.selectRequestbyTaskId(req.params.task_id);
        console.log("get request again : " + result[0].job_id)

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

router.post('/getresult', async (req, res) => {

    console.log('router getresult ', req.body)
    let result_json = []
    let response = null
    jobs = await handler.getGenJobId(req.body.request_ids)

    for await (const job of jobs) {
        // const result = await exodus.getResult(job.job_id)
        try {
            console.log("get result job : ", job.job_id)
            response = await axios.get(`http://localhost:4000/api/getresult/${job.job_id}`);
        } catch (err) {
            console.log(err);
            return;
        }

        if (response && response.data.result === 0) {
            console.log('correct response')
            result_json.push(response.data.contents)
        }
    }

    try {
        [filepath, filename] = await taskManager.createResultfile(req.body.request_ids, result_json);
        res.status(200).json({
            status: 0, // 0: success, other-error code
            filename: filename,
            download_url: filepath, //'http://localhost:4000/public/images/UserPointData_0.pts',
            message: "success" // 결과 메시지, eg. “SUCCCESS”
        });
    } catch (err) {
        res.status(500).json({
            status: -1,
            filename: '',
            download_url: '',
            message: "fail"
        });

    }

});

module.exports = router;
