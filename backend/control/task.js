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
    try {
        [fullPath, taskId] = getTaskPath(taskNo);
    }
    catch (err) {
        console.log('create task err : ', err)
        return [-1, -1, -1]
    }

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
                    reject(-1)
                    return -1;
                }
                console.log(data)
                try {
                    obj = JSON.parse(data)
                } catch (err) {
                    console.log('parsing json err ', err)
                    reject(-1)
                    return -1;
                }
                if (obj === '') {
                    reject(-1)
                }
                console.log(Object.keys(obj.points).length)
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
                return 0;
            });
        });
    });
}

exports.createResultfile = async function (request_ids, result_json, result_group) {
    console.log('create result file ')
    console.log('result group input : ', result_group)

    let content = new Object()
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

                content['RecordName'] = obj.RecordName;
                content['PreSetNumber'] = obj.PreSetNumber;
                content['worlds'] = obj.worlds;

                content['points'] = [];
                console.log('process check.. contents ', content)
                let temp_array = []
                for (let a = 0; a < request_ids.length; a++) {
                    for (let i = 0; i < result_json[a].points.length; i++) {
                        temp_array.push(result_json[a].points[i])
                    }
                }

                for (let n = 0; n < obj.points.length; n++) {
                    console.log('for enter : ', n, obj.points[n].Group)
                    let bIn = false
                    for (let m = 0; m < result_group.length; m++) {
                        if (obj.points[n].Group === result_group[m]) {
                            // console.log('skip this cam : ', obj.points[n].Group, obj.points[n].dsc_id)
                            bIn = true
                            break;
                        }
                    }
                    if (bIn === false) {
                        console.log('add this cam : ', obj.points[n].Group, obj.points[n].dsc_id)
                        temp_array.push(obj.points[n])
                    }
                }

                content['points'] = temp_array;
                // console.log(content)
                // const newPath = fullPath + `UserPointData_${request_ids[0]}.pts`; //local test
                const today = new Date();
                const date = today.getDate();
                const month = today.getMonth() + 1;
                const year = today.getFullYear();
                const hours = today.getHours();
                const minutes = today.getMinutes();
                const seconds = today.getSeconds();
                const now = year + '_' + month + date + "_" + hours + minutes + seconds;
                const strnow = String(now)

                const newFile = `UserPointData_${request_ids[0]}_${strnow}.pts`;
                const newPath = process.env.AUTO_CALIB_DIR_PTS + newFile;
                console.log('before file write', newPath)
                fs.writeFileSync(newPath, JSON.stringify(content, null, 4), 'utf8', err => {
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

exports.getReivewImages = async function (job_id, labatory) {
    console.log('task getReviewImages : ', job_id, labatory)
    let images = []
    let fullpath = process.env.AUTO_CALIB_DIR_REVIEW + String(job_id);
    if (labatory === 'true') {
        fullpath = process.env.AUTO_CALIB_DIR_ANALYSIS + String(job_id);
    }
    console.log('getReviewImages full path : ', fullpath)

    return new Promise((resolve, reject) => {
        fs.readdir(fullpath, function (err, filelist) {

            for (const file of filelist) {
                const filepath = String(job_id) + '/' + file
                images.push(filepath)
            }
            resolve(images)
        });
    });
}
