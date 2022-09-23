require("dotenv").config();
const util = require('util');
const fs = require("fs");
const express = require('express'),
  multer = require('multer'),
  router = express.Router();

const taskManager = require('./task.js')

const upload_images = (destPath) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // cb(null, process.env.AUTO_CALIB_DIR);
      cb(null, destPath);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  });
  const isValidFile = (file) => {
    const mimeType = file.mimetype;
    let ext = file.originalname.split('.');

    ext = ext.length > 1 ? ext[1].toLowerCase() : '';

    const isValidMimeType = (mimeType == "image/png" || mimeType == "image/jpeg");
    const isValidExt = (ext == "png" || ext == "jpg" || ext == "jpeg");

    return (isValidMimeType && isValidExt) || ext == "pts" || ext == "txt";
  }

  const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      if (isValidFile(file)) {
        cb(null, true);
      } else {
        cb(null, false);
        return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
      }
    }
  });

  return upload;
}
router.post('/upload', async (req, res, next) => {

  const imageDir = process.env.AUTO_CALIB_DIR;
  console.log("upload post start : " + imageDir)
  let taskNo = 0;
  let taskId = 0;
  [taskNo, taskId, fullPath] = await taskManager.createNewTask()
  console.log("post upload: " + fullPath)

  if (taskNo == -1) {
    res.status(500).json({})
  }

  // try {
  //   if (fs.existsSync(imageDir)) {
  //     fs.readdirSync(imageDir).forEach(function (file, index) {
  //       var curPath = imageDir + "/" + file;
  //       fs.unlinkSync(curPath);
  //       console.log("Delete old image: " + curPath);
  //     });
  //   } for delete already existed

  const upload = upload_images(fullPath);
  upload.array('imgCollection', 1000);
  const uploadObj = util.promisify(upload.any());

  await uploadObj(req, res);
  result = await taskManager.parsingGroupInfo(taskNo, taskId, fullPath)

  res.send({
    status: 0,
    message: 'success',
    taskId: taskId,
    taskPath: fullPath,
  });

});

module.exports = router;
