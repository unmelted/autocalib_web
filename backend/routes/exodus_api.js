require("dotenv").config();
let express = require('express'),
  multer = require('multer'),
  router = express.Router();
const request = require('request');
const path = require("path");
var handler = require('../db/handler.js')

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
  console.log(req.body.group_id);
  request.post(options, async function (err, response, body) {
    if (!err) {
      console.log("Response: " + JSON.stringify(body));
      result = await handler.insertNewTaskRequest('cal', ['CALCULATE', req.body.task_id, req.body.group_id, body.job_id])
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

  console.log("Call Exodus API: " + options.uri);
  request.get(options, async function (err, response, body) {
    if (!err) {
      console.log("Response: " + JSON.stringify(body));
      res.status(200).json({
        result: body.result,
        percent: body.status,
        job_id: body.job_id,
        message: body.message
      });

      result = await handler.updateTaskRequest([body.status, body.result !== null ? body.result : '', body.message, req.params.job_id], false);
      console.log("updateTask for status is done ");

    } else {
      console.log(err)
      res.status(500).json({})
    }
  });

});

router.delete('/cancel/:job_id', (req, res) => {
  // Exodus API: 7.1.2	GET /exodus/autocalib/cancle/{ job_id }
  const options = {
    uri: process.env.AUTO_CALIB_EXODUS_URL + '/exodus/autocalib/cancel/' + req.params.job_id,
    method: 'DELETE',
    json: true
  }

  console.log("Call Exodus API: " + options.uri);
  request.delete(options, async function (err, response, body) {
    if (!err) {
      console.log("Response: " + JSON.stringify(body));
      res.status(200).json({
        status: body.result,
        job_id: body.job_id,
        message: "success"
      });

      result = await handler.updateTaskRequest(['CANCEL', '', req.params.job_id], true);
      console.log("updateTask for cancel is done ");

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

  console.log("Call Exodus API: " + options.uri, req.body.job_id);
  request.post(options, async function (err, response, body) {
    if (!err) {
      console.log("Response: " + JSON.stringify(body));
      result = await handler.insertNewTaskRequest('gen', ['GENERATE', req.body.task_id, req.body.group_id, body.job_id, req.body.pts_2d, req.body.pts_3d])
      console.log("insert task request(generate) , return : " + result);

      res.status(200).json({
        status: 0,
        job_id: body.job_id,
        result: "success",
        request_id: result,
      });
    } else {
      console.log(err)
      res.status(500).json({})
    }
  });

});

router.get('/getresult/:job_id', (req, res) => {
  //function getResult(job_id) {
  // Exodus API: 7.1.3	GET /exodus/autocalib/getresult/{job_id}
  let result = {}
  const options = {
    uri: process.env.AUTO_CALIB_EXODUS_URL + '/exodus/autocalib/getresult/' + req.params.job_id,
    method: 'GET',
    json: true
  }

  console.log("Call Exodus API: " + options.uri);
  request.get(options, async function (err, response, body) {
    if (!err) {
      // console.log("Response: " + JSON.stringify(body));
      console.log('detail .. ', body.job_id, body.result)
      // result['job_id'] = body.job_id;
      // result['result'] = body.result;
      // result['message'] = body.message;
      // result['contents'] = body.contents;
      // console.log('get result from exodus api is end .. ', result['job_id'])
      res.status(200).json({
        job_id: body.job_id,
        result: body.result,
        message: body.message,
        contents: body.contents
      });
    } else {
      console.log(err)
      result.result = -1;
    }
  });

  return result;
});


router.get('/getversion', (req, res) => {
  // Exodus API: 7.1.2	GET /exodus/autocalib/getversion
  const options = {
    uri: process.env.AUTO_CALIB_EXODUS_URL + '/exodus/autocalib/getversion',
    method: 'GET',
    json: true
  }

  console.log("Call Exodus API: " + options.uri);
  request.get(options, async function (err, response, body) {
    if (!err) {
      console.log("Response: " + JSON.stringify(body));
      res.status(200).json({
        body
      });

    } else {
      console.log(err)
      res.status(500).json({})
    }
  });
}

); module.exports = router;
