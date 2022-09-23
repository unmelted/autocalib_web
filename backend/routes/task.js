require("dotenv").config();
const fs = require('fs');
const path = require("path");

var handler = require('../db/handler.js')


getNewTaskNo = async function () {
    try {
        let newNo = -1;
        newNo = await handler.getTaskNo();
        console.log(newNo)
        newNo = newNo + 1
        console.log("getTaskId is called return : ", newNo);
        return newNo;

    } catch (err) {
        console.log(err)
        return -1
    }
}

getTaskPath = function (taskNo) {
    const baseDir = process.env.AUTO_CALIB_DIR;
    const today = new Date();
    const date = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const now = year + "_" + month + date + "_" + String(taskNo);
    const taskId = String(now)
    const fullPath = path.join(String(baseDir), String(now)) + '/'
    console.log(fullPath);

    try {
        fs.mkdirSync(fullPath);
    } catch (err) {
        console.error(err);
    }

    return [fullPath, taskId];
}

exports.createNewTask = async function () {

    taskNo = await getNewTaskNo();
    if (taskNo < 0) {
        return [-1, -1, -1];
    }
    console.log("task no " + taskNo)
    let taskId = 0;
    let fullPath = 0;
    [fullPath, taskId] = getTaskPath(taskNo);
    console.log("task path : " + taskId)

    result = await handler.insertNewTask(taskNo, taskId, fullPath)

    if (result < 0) {
        return [-1, -1, -1]
    } else {
        return [taskNo, taskId, fullPath];
    }
}



exports.parsingGroupInfo = async function (taskNo, taskId, fullPath) {
    console.log("full path : " + taskId)
    let ptsfile = '';
    fs.readdir(fullPath, function (err, filelist) {

        for (const file of filelist) {
            const ext = file.split('.');
            if (ext[1].toLowerCase() == 'pts') {
                ptsfile = file;
                break;
            }
        }
        console.log("selected pts file : " + ptsfile)

        if (ptsfile == '') {
            return -1
        }

        let group = {}
        pts = fullPath + ptsfile;
        console.log("parsingGroupinfo : " + pts)
        fs.readFile(pts, 'utf-8', function (err, data) {
            if (err) {
                return -1
            }

            obj = JSON.parse(data)
            console.log(Object.keys(obj.points).length)
            for (let i = 0; i < Object.keys(obj.points).length; i++) {
                if (Object.keys(group).indexOf(obj.points[i].Group) !== -1) {
                    group[obj.points[i].Group].push(obj.points[i].dsc_id)
                } else {
                    group[obj.points[i].Group] = [obj.points[i].dsc_id]
                }
            }

            // for (let i = 0; i < Object.keys(group).length; i++) {
            Object.keys(group).forEach(async data => {
                console.log("insert new group info " + taskId);
                console.log(data);
                console.log(group[data].length);
                await handler.insertNewGroupInfo([taskId, data, group[data].length]);
            });
        });
    });

    return 0
}