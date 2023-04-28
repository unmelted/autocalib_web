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

router.get('/getversion', async (req, res) => {

    console.log("getversion is called ");
    let ex_version = 0

    const options = {
        uri: process.env.AUTO_CALIB_EXODUS_URL + '/exodus/autocalib/getversion',
        method: 'GET',
        json: true
    }

    console.log("Call Exodus API // request : " + options.uri);
    request.get(options, async function (err, response, body) {
        if (!err) {
            console.log("Response: " + JSON.stringify(body));
            ex_version = body.version

        } else {
            console.log(err)
            res.status(500).json({})
            return
        }

        result = process.env.AUTO_CALIB_VERSION;
        console.log('result ', result, ex_version)

        res.status(200).json({
            exodus_version: ex_version,
            back_version: result,
        })
    });
});

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
        console.log("get group info end  : " + result.length)
        res.status(200).json({
            message: 'success',
            group: result,
        });

    } catch (err) {
        console.log(err)
        res.status(500).json({})
    }
});

router.get('/groupstatus/:group_no', async (req, res) => {

    console.log("router groupinfo task id : ", req.params.group_no)

    try {
        result = await handler.getGroupStatus(req.params.group_no)
        if (result === 0) {
            console.log("get group info end 1")
            res.status(200).json({
                message: 'success',
                request_id: 0,
                job_id: 0,
            });

        } else {
            console.log("get group info end 2 : " + result[0].request_id)
            res.status(200).json({
                message: 'success',
                request_id: result[0].request_id,
                job_id: result[0].job_id
            });
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({})
    }

});

router.post('/getresult', async (req, res) => {

    console.log('router getresult ', req.body)
    let result_json = []
    let result_group = []
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
            result_json.push(response.data.contents)
            result_group.push(job.group_id)
            // result_json[job.group_id] = response.data.contents
        }
    }

    try {
        [filepath, filename] = await taskManager.createResultfile(req.body.request_ids, result_json, result_group);
        console.log('getresult send success')
        res.status(200).json({
            status: 0, // 0: success, other-error code
            filename: filename,
            download_url: filepath, //'http://localhost:4000/public/images/UserPointData_0.pts',
            message: "success" // 결과 메시지, eg. “SUCCCESS”
        });
    } catch (err) {
        console.log('getresult send fail')
        res.status(500).json({
            status: -1,
            filename: '',
            download_url: '',
            message: "fail"
        });

    }

});


router.get('/getreview/:request_id/:labatory', async (req, res) => {

    console.log("router getreivew request_id : ", req.params.request_id, req.params.labatory)
    let lab = req.params.labatory

    try {
        result = await handler.getReviewImages(req.params.request_id)
        console.log('getReviewImages hander return : ', result.length)
        if (result.length === 1) {
            const job_id = result[0].job_id
            console.log("query pts .. ", result[0].pts_3d, result[0].world)
            if (lab === 'true') {
                if (result[0].pts_2d !== null) {
                    lab = 'true'
                } else if (result[0].pts_3d !== null && result[0].world !== null) {
                    lab = 'true'
                } else {
                    lab = 'false'
                }
            }
            console.log("final lab? ", lab)
            try {
                images = await taskManager.getReivewImages(job_id, lab);
                console.log('images.. ', images)
                res.status(200).json({
                    status: 0,
                    labatory: lab,
                    images: images
                });

            } catch (err) {
                console.log('taskmanager get reivew images fail : ', err)
                res.status(500).json({})
            }

        } else {
            console.log('cannot get review images . ')
            res.status(500).json({})
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).json({})
    }

});

router.get('/gettaskimages/:task_id', async (req, res) => {

    console.log("get task images is called ", req.params.task_id);

    try {
        result = await taskManager.parsingDscList(req.params.task_id);

        if (result < 0) {
            console.log("gettaskimages error : ", result);
            res.status(500).json({})

        }

        res.status(200).json({
            message: 'success',
            request_array: result,
        });

    } catch (err) {
        console.log(err)
        res.status(500).json({})
    }
})

router.get('/createmulti/:task_id/:cam_count', async (req, res) => {

    console.log("router create multitracker task id : ", req.params.task_id)
    tr_taskid = taskManager.getNewTrTaskNo(req.params.task_id)

    try {
        result = await handler.createMultiTracker(tr_taskid, req.params.task_id, req.params.cam_count)
        console.log("create multi tracker end ")

        res.status(200).json({
            message: 'success',
            tracker_taskid: tr_taskid,
        });

    } catch (err) {
        console.log(err)
        res.status(500).json({})
    }
});

router.post('/updatetracker', async (req, res) => {

    console.log("router update tracker task_id : ", req.body.task_id)
    console.log("info map : ", req.body.info_map)

    try {
        result = await handler.updateMultiTracker(tr_taskid, req.body.task_id, req.body.cam_count)
        console.log("create multi tracker end ")

        const options = {
            uri: process.env.KRONOS_URL + '/kronos/status',
            method: 'GET',
            json: true
        }

        console.log("Call Kronos API // request : " + options.uri);
        request.get(options, async function (err, response, body) {
            if (!err) {
                console.log("Response status : " + JSON.stringify(body.status));

            } else {
                console.log(err)
                res.status(500).json({})
            }
        });


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
