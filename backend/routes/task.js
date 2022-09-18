require("dotenv").config();

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

    task = this.task_id
    const date_ob = new Date();
    const date = date_ob.getDate();
    const month = date_ob.getMonth() + 1;
    const year = date_ob.getFullYear();
    const now = year + "_" + month + date + "_" + String(task);
    console.log(month)
    const folderName = path.join(String(baseDir), String(now))
    console.log(folderName);

    try {
        fs.mkdirSync(folderName);
    } catch (err) {
        console.error(err);
    }

    return folderName;
}

exports.createNewTask = function () {
    console.log("start createnewtask")
    task_id = getTaskId();
    console.log("task id " + task_id)
    task_path = getTaskPath();
    console.log("task path : " + task_path)
    return [task_id, task_path];
}


