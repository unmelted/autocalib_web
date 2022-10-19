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

async function insertGroup(taskId, group, item) {
    result = await handler.insertNewGroupInfo([taskId, item, group[item].length]);
}

insertGroupInfo = async function (taskId, group) {
    console.log("start insertGroupInfo .. " + group)
    console.log(taskId)
    Object.keys(group).forEach(data => {
        console.log("insert new group info " + taskId);
        console.log(data);
    });

    for (const item of Object.keys(group)) {
        await insertGroup(taskId, group, item);
    }
    console.log("end for")
}

exports.parsingGroupInfo = async function (taskId, fullPath) {
    console.log("full path : " + taskId)
    let ptsfile = '';
    let group = {}
    let result = -1;
    return new Promise((resolve, reject) => {
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
                resolve(-1)
            }

            pts = fullPath + ptsfile;
            console.log("parsingGroupinfo : " + pts)
            fs.readFile(pts, 'utf-8', async function (err, data) {
                if (err) {
                    resolve(-1)
                }

                try {
                    obj = JSON.parse(data)
                    console.log(Object.keys(obj.points).length)
                } catch (err) {
                    console.log('parsing json err ', err)
                    reject(-1)
                }

                for (let i = 0; i < Object.keys(obj.points).length; i++) {
                    if (Object.keys(group).indexOf(obj.points[i].Group) !== -1) {
                        group[obj.points[i].Group].push(obj.points[i].dsc_id)
                    } else {
                        group[obj.points[i].Group] = [obj.points[i].dsc_id]
                    }
                }

                Object.keys(group).forEach(data => {
                    console.log("check.. ", data);
                });

                console.log("before.. " + taskId);
                console.log("before insert .." + group);
                await insertGroupInfo(taskId, group);
                console.log("end insert group ..")
                resolve(0)
            });
        });
    });
}

exports.createResultfile = async function (request_ids, result_json) {
    console.log('create result file ')
    let content = '';
    let ptsfile = '';
    const fullPath = await handler.getFullPath(request_ids[0])

    return new Promise((resolve, reject) => {
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
                reject(-1)
            }

            pts = fullPath + ptsfile;
            console.log("parsing  : " + pts)
            fs.readFile(pts, 'utf-8', function (err, data) {
                if (err) {
                    reject(-1)
                }

                obj = JSON.parse(data)
                console.log(Object.keys(obj.points).length)
                content = obj; //copy
                content.points = []; //init
                console.log('process check.. contents ', content)

                for (let a = 0; a < request_ids.length; a++) {
                    for (let i = 0; i < result_json[a].points.length; i++) {
                        content.points.push(result_json[a].points[i])
                    }
                }
                console.log('assemble contents.. ', content);
                // const newPath = fullPath + `UserPointData_${request_ids[0]}.pts`; //local test
                const newPath = '/Users/4dreplay/work/sfm_python/test_pts/' + `UserPointData_${request_ids[0]}.pts`;
                const newFile = `UserPointData_${request_ids[0]}.pts`;
                console.log('before file write', newFile)
                fs.writeFileSync(newPath, JSON.stringify(content), 'utf8', err => {
                    if (err) {
                        console.log('fs write file err : ', err)
                        reject(-10)
                    }
                });
                console.log("end create result file ..")
                resolve([newPath, newFile])
            });
        });
    });

}