require("dotenv").config();
let express = require('express'),
  multer = require('multer'),
  router = express.Router();
const request = require('request');
const path = require("path");
var handler = require('../db/handler.js')

// Test Progress
let counter = 0;

router.post('/calculate', async (req, res, next) => {
  // Exodus API: Call 7.1.1	POST /exodus/autocalib
  const fullPath = path.join(process.env.AUTO_CALIB_DIR_SEND, req.body.task_id)
  console.log("calculate input_dir : " + fullPath)
  const options = {
    uri: process.env.AUTO_CALIB_EXODUS_URL + '/exodus/autocalib',
    method: 'POST',
    body: {
      // input_dir: process.env.AUTO_CALIB_DIR_SEND,
      input_dir: fullPath,
      group: req.body.group_id,
    },
    json: true
  }

  console.log("Call Exodus API: " + options.uri);
  console.log(req.body.task_id);
  console.log(req.body.task_path);
  request.post(options, async function (err, response, body) {
    if (!err) {
      console.log("Response: " + JSON.stringify(body));
      result = await handler.insertNewTaskRequest(['CALCULATE', req.body.task_id, req.body.group_id, body.job_id])
      console.log("insert task request , return : " + result);

      res.status(200).json({
        status: body.status,
        job_id: body.job_id,
        message: body.message,
        request_id: result,
      });
    } else {
      console.log(err)
      res.status(500).json({})
    }
  });

});

router.get('/calculate/status/:job_id', (req, res) => {
  // Exodus API: 7.1.2	GET /exodus/autocalib/status/{ job_id }
  const options = {
    uri: process.env.AUTO_CALIB_EXODUS_URL + '/exodus/autocalib/status/' + req.params.job_id,
    method: 'GET',
    json: true
  }

  // Exodus Calculation Simulator
  // counter += 20;
  //
  // if (counter > 100) {
  //   counter = 0;
  // }

  console.log("Call Exodus API: " + options.uri);
  request.get(options, function (err, response, body) {
    if (!err) {
      console.log("Response: " + JSON.stringify(body));
      res.status(200).json({
        status: body.result,
        percent: body.status,
        job_id: body.job_id,
        message: "success"
      });
    } else {
      console.log(err)
      res.status(500).json({})
    }
  });

});

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


router.delete('/cancel/:job_id', (req, res) => {
  // Exodus API: 7.1.2	GET /exodus/autocalib/cancle/{ job_id }
  const options = {
    uri: process.env.AUTO_CALIB_EXODUS_URL + '/exodus/autocalib/cancel/' + req.params.job_id,
    method: 'DELETE',
    json: true
  }

  console.log("Call Exodus API: " + options.uri);
  request.delete(options, function (err, response, body) {
    if (!err) {
      console.log("Response: " + JSON.stringify(body));
      res.status(200).json({
        status: body.result,
        job_id: body.job_id,
        message: "success"
      });
    } else {
      console.log(err)
      res.status(500).json({})
    }
  });

});


router.get('/image/:job_id', (req, res) => {
  // Exodus API: 7.1.3	GET /exodus/autocalib/getpair/{job_id}
  const options = {
    uri: process.env.AUTO_CALIB_EXODUS_URL + '/exodus/autocalib/getpair/' + req.params.job_id,
    method: 'GET',
    json: true
  }

  console.log("Call Exodus API: " + options.uri);
  request.get(options, function (err, response, body) {
    if (!err) {
      console.log("Response: " + JSON.stringify(body));
      res.status(200).json({
        status: body.result,
        job_id: body.job_id,
        first_image: body.first_image,
        second_image: body.second_image,
        message: "success"
      });
    } else {
      console.log(err)
      res.status(500).json({})
    }
  });
});

router.post('/generate/:job_id', (req, res, next) => {
  // Exodus API: 7.1.4	POST /exodus/autocalib/generate/{job_id}
  const options = {
    uri: process.env.AUTO_CALIB_EXODUS_URL + '/exodus/generate',
    method: 'POST',
    body: {
      job_id: req.body.job_id,
      pts_2d: req.body.pts_2d,
      pts_3d: req.body.pts_3d
    },
    json: true
  }

  console.log("Call Exodus API: " + options.uri);
  request.post(options, function (err, response, body) {
    if (!err) {
      console.log("Response: " + JSON.stringify(body));
      res.status(200).json({
        status: 0,
        job_id: body.job_id,
        result: "success"
      });
    } else {
      console.log(err)
      res.status(500).json({})
    }
  });

  // res.status(200).json({
  //   status: 0, // 0: success, other-error code
  //   filename: 'UserPointData_0.pts',
  //   download_url: 'http://localhost:4000/public/images/UserPointData_0.pts',
  //   message: "success" // 결과 메시지, eg. “SUCCCESS”
  // });
});

module.exports = router;
