require("dotenv").config();

const { NONAME } = require("dns");
const fs = require('fs');
const path = require("path");

let globalTaskId = 1000;

getTaskId = function () {
    globalTaskId = globalTaskId + 1;
    console.log("getTaskId is called return : ", globalTaskId);
    return globalTaskId;
}

getTaskPath = function (obj = {}) {
    const baseDir = process.env.AUTO_CALIB_DIR;
    console.log("task js : " + baseDir)

    task = this.taskId
    const today = new Date();
    const date = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const now = year + "_" + month + date + "_" + String(task);
    const folderName = String(now)
    const fullName = path.join(String(baseDir), String(now))
    console.log(fullName);

    try {
        fs.mkdirSync(fullName);
    } catch (err) {
        console.error(err);
    }

    return [fullName, folderName];
}

exports.createNewTask = function () {
    console.log("start createnewtask")
    taskId = getTaskId();
    console.log("task id " + taskId)
    let taskPath = 0;
    let fullPath = 0;
    [fullPath, taskPath] = getTaskPath();
    console.log("task path : " + taskPath)
    return [taskId, fullPath, taskPath];
}


