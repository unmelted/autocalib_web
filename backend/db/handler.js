
var db = require('../db/index.js')


exports.getTaskNo = function () {
    console.log("getTask No handler function is called ")
    return new Promise((resolve, reject) => {
        db.getClient((errClient, client) => {
            if (errClient) {
                console.log("client connect err " + err)
                resolve(-1)
            }

            q = "SELECT task_no FROM task ORDER BY task_no DESC;";
            console.log("getTaskNo " + q)
            db.query(q, (err, res) => {
                client.release(true);
                if (err) {
                    console.log(err)
                    resolve(-1)
                }
                else {
                    console.log('getTaskNo query success' + res.rows[0]['task_no']);
                    if (res.rows.length > 0) {
                        resolve(res.rows[0]['task_no'])
                    }
                    else {
                        resolve(-10)
                    }
                }
            }, client);

        });
    });
}

exports.insertNewTask = function (taskNo, taskPath, fullPath) {
    return new Promise((resolve, reject) => {
        db.getClient((errClient, client) => {
            if (errClient) {
                console.log("client connect err " + err)
                resolve(-1)
            }

            db.queryParams("INSERT INTO task (task_no, task_id, task_path) VALUES ($1, $2, $3)", [taskNo, taskPath, fullPath], (err) => {
                client.release(true);
                if (err) {
                    console.log(err)
                    resolve(-1);
                }
                console.log('insertNewTask query success');
                resolve(0)
            }, client);
        });
    });
}

exports.updateTask = function (params) {
    return new Promise((resolve, reject) => {
        db.getClient((errClient, client) => {
            if (errClient) {
                console.log("client connect err " + err)
                resolve(-1)
            }
            console.log(" update task param : ", params[0])
            db.queryParams("UPDATE task SET alias = $1 WHERE task_id = $2", params, (err) => {
                client.release(true);
                if (err) {
                    console.log(err)
                    resolve(-1)
                }
                console.log('updateTask query success');
                resolve(0)
            }, client);

        });
    });
}

exports.insertNewGroupInfo = function (params) {
    return new Promise((resolve, reject) => {
        db.getClient((errClient, client) => {
            if (errClient) {
                console.log("client connect err " + err)
                resolve(-1);
            }

            db.queryParams("INSERT INTO group_info (task_id, group_id, cam_count ) VALUES ($1, $2, $3)", params, (err) => {
                client.release(true);
                if (err) {
                    console.log(err)
                    resolve(-1)
                }
                console.log('insertNewGroupInfo query success');
                resolve(0)
            }, client);
        });
    });
};


exports.insertNewTaskRequest = function (mode, params) {
    return new Promise((resolve, reject) => {
        db.getClient((errClient, client) => {
            if (errClient) {
                console.log("client connect err " + err)
                resolve(-1)
            }

            if (mode === 'cal') {
                db.queryParams("INSERT INTO task_request (request_category, task_id, group_id, job_id ) VALUES ($1, $2, $3, $4)", params, (err) => {
                    // client.release(true);
                    if (err) {
                        console.log(err)
                        resolve(-1)
                    }
                    console.log('insertNewTaskRequest cal query success');

                    db.queryParams("SELECT request_id FROM  task_request WHERE request_category = $1 and task_id = $2 and group_id = $3 and job_id = $4", params, (err, res) => {
                        client.release(true);
                        if (err) {
                            console.log(err)
                            resolve(-1)
                        }
                        if (res.rows.length > 0) {
                            console.log('select current request_id ' + res.rows[0]['request_id']);
                            resolve(res.rows[0]['request_id'])
                        }
                        else {
                            resolve(-10)
                        }
                    }, client)

                }, client);
            } else if (mode === 'gen') {
                db.queryParams("INSERT INTO task_request (request_category, task_id, group_id, job_id, pts_2d, pts_3d ) VALUES ($1, $2, $3, $4, $5, $6)", params, (err) => {
                    // client.release(true);
                    if (err) {
                        console.log(err)
                        resolve(-1)
                    }
                    console.log('insertNewTaskRequest gen query success');

                    db.queryParams("SELECT request_id FROM  task_request WHERE request_category = $1 and task_id = $2 and group_id = $3 and job_id = $4", params, (err, res) => {
                        client.release(true);
                        if (err) {
                            console.log(err)
                            resolve(-1)
                        }
                        if (res.rows.length > 0) {
                            console.log('select current request_id ' + res.rows[0]['request_id']);
                            resolve(res.rows[0]['request_id'])
                        }
                        else {
                            resolve(-10)
                        }
                    }, client)

                }, client);

            }

        });
    });
}

exports.updateTaskRequest = function (params, isCancel) {
    return new Promise((resolve, reject) => {
        db.getClient((errClient, client) => {
            if (errClient) {
                console.log("client connect err " + err)
                resolve(-1)
            }
            console.log("updateTaskRequest params ", params)
            if (isCancel === true) {
                db.queryParams("UPDATE task_request SET job_result = $1, job_message = $2, cancel_date = NOW() WHERE job_id = $3;", params, (err) => {
                    client.release(true);
                    if (err) {
                        console.log(err)
                        resolve(-1)
                    }
                    console.log('updateTaskRequest query success');
                    resolve(0)
                }, client);

            } else {
                db.queryParams("UPDATE task_request SET job_status = $1, job_result = $2, job_message = $3  WHERE job_id = $4;", params, (err) => {
                    client.release(true);
                    if (err) {
                        console.log(err)
                        resolve(-1)
                    }
                    console.log('updateTaskRequest query success');
                    resolve(0)
                }, client);
            }
        });
    });
}

exports.getGroupInfo = function (taskId) {
    console.log("handler groupinfo ", taskId)
    return new Promise((resolve, reject) => {
        db.getClient((errClient, client) => {
            if (errClient) {
                console.log("client connect err " + err)
                reject(-1)
            }

            db.queryParams("SELECT group_id, cam_count, no from group_info WHERE task_id = $1; ", [taskId], (err, res) => {
                client.release(true);
                if (err) {
                    console.log(err)
                    reject(-1);
                }
                else {
                    if (res.rows.length > 0) {
                        console.log('get GroupInfo query success ' + res.rows[0].group_id);
                        resolve(res.rows)
                    }
                    else {
                        console.log("get Groupinfo query no rows ")
                        reject(-10)
                    }
                }

            }, client);

        });
    });
}

exports.selectDatewithinRange = function () {
    return new Promise((resolve, reject) => {
        db.getClient((errClient, client) => {
            if (errClient) {
                console.log("client connect err " + err)
                resolve(-1);
            }

            db.query("SELECT task_no, task_id, createdate, alias FROM task WHERE createdate > (SELECT current_date - 7) and task_id != '-1' ORDER BY task_no DESC;", (err, res) => {
                client.release(true);
                if (err) {
                    console.log(err)
                    resolve(-1)
                }
                else {
                    console.log('select Date within range  query success', res.rows.length);
                    resolve(res.rows)
                }
            }, client);
        });
    });
};


exports.selectRequestbyTaskId = function (taskId) {
    return new Promise((resolve, reject) => {
        db.getClient((errClient, client) => {
            if (errClient) {
                console.log("client connect err " + err)
                reject(-1)
            }

            db.queryParams("SELECT task_id, request_id, request_category, group_id, createdate, job_id, job_status, job_result, job_message FROM task_request WHERE task_id = $1; ", [taskId], (err, res) => {
                client.release(true);
                if (err) {
                    console.log(err)
                    reject(-1);
                }
                else {
                    if (res.rows.length > 0) {
                        console.log('get GroupInfo query success ' + res.rows[0].group_id);
                        resolve(res.rows)
                    }
                    else {
                        console.log("get Groupinfo query no rows ")
                        reject(-10)
                    }
                }

            }, client);

        });
    });
}