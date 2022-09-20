require("dotenv").config();
const util = require('util');
const fs = require("fs");
const express = require('express'),
  multer = require('multer'),
  router = express.Router();

var taskManager = require('./task.js')

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
  let taskId = 0;
  let taskPath = 0;
  [taskId, fullPath, taskPath] = taskManager.createNewTask()
  console.log("post upload: " + fullPath)

  // try {
  //   if (fs.existsSync(imageDir)) {
  //     fs.readdirSync(imageDir).forEach(function (file, index) {
  //       var curPath = imageDir + "/" + file;
  //       fs.unlinkSync(curPath);
  //       console.log("Delete old image: " + curPath);
  //     });
  //   }

  const upload = upload_images(fullPath);
  upload.array('imgCollection', 1000);
  const uploadObj = util.promisify(upload.any());

  await uploadObj(req, res);
  res.send({
    status: 0,
    message: 'success',
    taskId: taskId,
    taskPath: taskPath,
  });

  // } catch (err) {
  //   console.log(err)
  //   res.status(500).json({})
  // }

});

module.exports = router;
