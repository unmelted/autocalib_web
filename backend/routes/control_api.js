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
        result = await handler.updateTask([req.body.task_alias, req.body.from, req.body.task_id]);
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

router.get('/get_trackertask', async (req, res) => {

    console.log("get_trackertask is called ");

    try {
        result = await handler.selectTrackerDatewithinRange();

        if (result === -1) {
            res.status(500).json({})
        }
        else if (result.length === 0) {
            res.status(200).json({
                message: 'no records',
                task_array: result,
            });
        }
        else {
            for (const row of result) {
                console.log(row)
                console.log("get tracker status  : " + row.kairos_task_id)
                if (row.kairos_task_id !== null || parseInt(row.kairos_task_id) > 0) {
                    const options = {
                        uri: process.env.AUTO_CALIB_EXODUS_URL + '/kairos/mct/status/' + row.kairos_task_id,
                        method: 'GET',
                        json: true
                    }

                    console.log("Call Exodus API // request : " + options.uri);
                    request.get(options, async function (err, response, body) {
                        if (!err) {
                            result = await handler.updateMultiTracker(req.body.tracker_task_id, 'run_status', body.status)

                            row.run_status = body.status
                            row.message = body.message
                        } else {
                            console.log(err)
                            res.status(500).json({})
                        }
                    });
                }
                else {
                    row.run_status = 'None'
                    row.message = 'None'
                }
            }

            res.status(200).json({
                message: 'success',
                task_array: result,
            });
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({})
    }
})

router.get('/getrequest/:task_id', async (req, res) => {

    console.log("getrequest is called ", req.params.task_id);

    try {
        result = await handler.selectRequestbyTaskId(req.params.task_id);

        if (result.length === 0) {
            res.status(200).json({
                message: 'no records',
                request_array: [],
            });
        }
        else {
            for (const row of result) {
                console.log("get request  : " + result[0].job_id)
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
        }

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
        result, rows = await handler.createMultiTracker(tr_taskid, req.params.task_id, req.params.cam_count)
        console.log("create multi tracker end ", result, rows)

        if (result < 0) {
            console.log(err)
            res.status(500).json({ message: 'fail' })

        }
        else {
            res.status(200).json({
                message: 'success',
                tracker_taskid: tr_taskid,
                tracker_exodus_id: rows
            });

        }

    } catch (err) {
        console.log(err)
        res.status(500).json({})
    }
});

router.post('/updatetracker', async (req, res) => {

    const data = req.body
    console.log("update tracker ", data)
    let calib_type = 'None'
    let calib_file = 'None'
    let calib_data = {}
    let code = 0

    try {
        result = await handler.updateMultiTrackerMap(req.body.tracker_task_id, req.body.info_map)
        console.log("update multi tracker end ")

        if (result == 0) {
            if (req.body.upload_type === 'exodus' || req.body.upload_type === null) {
                calib_type = 'exodus'
                code, calib_data = await handler.getCalibJobId(req.body.tracker_task_id, req.body.info_map)
                console.log("exodus === calib data ", code, calib_data)
                if (code < 0) {
                    res.status(500).json({ message: 'There is no generation history' })
                }
            } else {
                calib_type = 'file'
                const [result, c_file] = await taskManager.getCalibPtsFile(req.body.task_id)
                calib_file = c_file
                console.log("result, calib_file", result, calib_file)
                console.log("kairos upload  calib data ", calib_type, calib_file)
            }
        }

        if (result == 0) {

            let trackers_info = []
            for (const cam of Object.keys(req.body.info_map)) {

                let tracker = {}
                tracker.camera_id = cam
                if (calib_type === 'file') {
                    tracker.calib_job_id = -1

                } else {
                    tracker.calib_job_id = calib_data.data[cam]
                    console.log("calib job id ", tracker.calib_job_id)
                }

                tracker.group = req.body.info_map[cam].group
                tracker.tracker_ip = req.body.info_map[cam].tracker_url
                tracker.stream_url = req.body.info_map[cam].stream_url
                console.log("add tracker ", tracker)
                trackers_info.push(tracker)
            }

            try {
                const options = {
                    uri: process.env.KAIROS_URL + '/kairos/mct/ready',
                    method: 'POST',
                    body: {
                        task_id: req.body.tracker_task_id,
                        calib_type: calib_type,
                        calib_file: calib_file,
                        tracker: trackers_info,
                    },
                    json: true
                }

                console.log("send ready command to kairos ", options.body)
                request.post(options, async function (err, response, body) {
                    if (!err) {
                        console.log("Response: " + JSON.stringify(body));
                        console.log(Object.keys(body))

                        if (Object.keys(body).includes('job_id')) {
                            result = await handler.updateMultiTracker(req.body.tracker_task_id, 'job_id', body.job_id)
                            console.log("update multi tracker job id end result : ", result)

                            if (result < 0) {
                                console.log(err)
                                res.status(500).json({})

                            }
                            else {
                                res.status(200).json({
                                    status: body.status,
                                    job_id: body.job_id,
                                    message: body.message,
                                });
                            }
                        } else {
                            console.log(err)
                            res.status(500).json({})
                        }
                    } else {
                        console.log(err)
                        res.status(500).json({})
                    }
                });

            } catch (err) {
                console.log(err);
                res.status(500).json({})
            }

        }
        else {
            res.status(500).json({})
        }

    } catch (err) {
        console.log(err)
        res.status(500).json({})
    }
});

router.get('/get_trackerinfomap/:task_id', async (req, res) => {

    console.log("get_trackerinfomap task id : ", req.params.task_id)

    try {
        data = await handler.getTrackerInfoMap(req.params.task_id)
        console.log("getTrackerInfomap end ", JSON.parse(data.info_map))
        if (data < 0) {
            console.log(err)
            res.status(500).json({ message: 'fail' })

        }
        else {
            if (data.info_map === null) {
                res.status(200).json({
                    message: 'no data',
                    tracker_info: '',
                });

            } else {
                res.status(200).json({
                    message: 'success',
                    tracker_info: JSON.parse(data.info_map),
                });
            }

        }

    } catch (err) {
        console.log(err)
        res.status(500).json({})
    }
});


router.post('/ping', async (req, res) => {

    console.log("router update tracker tracker ip : ", req.body.tracker_ip)
    const options = {
        uri: process.env.KRONOS_URL + '/kronos/status',
        method: 'GET',
        json: true
    }

    console.log("Call Kronos API // request : " + options.uri);
    // request.get(options, async function (err, response, body)  {
    // if (!err) {
    // result = JSON.stringify(body.status)
    // console.log("Response status : " + result);

    res.status(200).json({
        status: 'success',
        message: 'ready',

    });

    // } else {
    // console.log(err)
    // res.status(500).json({})
    // }
    // });

});

router.put('/tracker_start/:job_id', async (req, res) => {

    console.log("router tracker start  job id : ", req.params.job_id)

    try {
        const options = {
            uri: process.env.KAIROS_URL + '/kairos/mct/start/' + req.params.job_id,
            method: 'PUT',
            json: true
        }

        console.log("send start command to kairos ")
        request.put(options, async function (err, response, body) {
            if (!err) {
                console.log("Start Response: " + JSON.stringify(body));
                result = await handler.updateMultiTracker(req.body.tracker_task_id, 'status', 'start')

                res.status(200).json({
                    result: body.result,
                    status: body.status,
                    message: body.message,
                });

            } else {
                console.log(err)
                res.status(500).json({})
            }
        });

    } catch (err) {
        console.log(err)
        res.status(500).json({})
    }
});

router.put('/tracker_stop/:job_id', async (req, res) => {

    console.log("router tracker stop job id : ", req.params.job_id)

    try {
        const options = {
            uri: process.env.KAIROS_URL + '/kairos/mct/stop/' + req.params.job_id,
            method: 'PUT',
            json: true
        }

        console.log("send stop command to kairos ")
        request.put(options, async function (err, response, body) {
            if (!err) {
                console.log("Stop Response: " + JSON.stringify(body));
                result = await handler.updateMultiTracker(req.body.tracker_task_id, 'status', 'stop')

                res.status(200).json({
                    result: body.result,
                    status: body.status,
                    message: body.message,
                });

            } else {
                console.log(err)
                res.status(500).json({})
            }
        });

    } catch (err) {
        console.log(err)
        res.status(500).json({})
    }
});

router.put('/tracker_destroy/:job_id', async (req, res) => {

    console.log("router tracker destory task id : ", req.params.job_id)

    try {
        const options = {
            uri: process.env.KAIROS_URL + '/kairos/mct/destroy/' + req.params.job_id,
            method: 'PUT',
            json: true
        }

        console.log("send destroy command to kairos ")
        request.put(options, async function (err, response, body) {
            if (!err) {
                console.log("destroy Response: " + JSON.stringify(body));
                result = await handler.updateMultiTracker(req.body.tracker_task_id, 'status', 'destroy')

                res.status(200).json({
                    result: body.result,
                    status: body.status,
                    message: body.message,
                });

            } else {
                console.log(err)
                res.status(500).json({})
            }
        });

    } catch (err) {
        console.log(err)
        res.status(500).json({})
    }
});


router.get('/get_visualinfo/:task_id', async (req, res) => {

    console.log("get_visualzeragne task id : ", req.params.task_id)
    const options = {
        uri: process.env.KAIROS_URL + '/kairos/mct/visualinfo/' + req.params.task_id,
        method: 'GET',
        json: true
    }

    console.log("Call Kairos API // request : " + options.uri);
    request.get(options, async function (err, response, body) {
        if (!err) {

            console.log("returned body : ", body)
            json_body = JSON.parse(body.data)

            res.status(200).json({
                status: body.status,
                result: body.result,
                message: body.message,
                start_time: json_body.start_time,
                end_time: json_body.end_time,
                start_frame: json_body.start_frame,
                end_frame: json_body.end_frame
            });

        } else {
            console.log(err)
            res.status(500).json({})
        }
    });

});


router.get('/get_visualdata/:task_id/:type/:target_frame1/:target_frame2', async (req, res) => {

    console.log("get_visualdata task id : ", req.params.task_id)
    if (req.params.target_frame1 === null || req.params.target_frame1 === undefined ||
        req.params.target_frame2 === null || req.params.target_frame2 === undefined) {
        console.log("get_visualdata target frame is null ")
        res.status(500).json({})
    }

    const options = {
        uri: process.env.KAIROS_URL + '/kairos/mct/visualdata/' + req.params.task_id + '/' + req.params.type + '/' + req.params.target_frame1 + '/' + req.params.target_frame2,
        method: 'GET',
        json: true
    }

    console.log("Call Kairos API // request : " + options.uri);
    request.get(options, async function (err, response, body) {

        if (!err) {
            console.log("returned body result: ", body.result)
            console.log(body.data)

            res.status(200).json({
                status: body.status,
                result: body.result,
                message: body.message,
                data: body.data,
            });

        } else {
            console.log(err)
            res.status(500).json({})
        }
    });

});

module.exports = router;
