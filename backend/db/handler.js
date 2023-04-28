
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
            }, client)
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
            //task_type = 'exodus' will add really.. 
            db.queryParams("INSERT INTO task (task_no, task_id, task_path) VALUES ($1, $2, $3);", [taskNo, taskPath, fullPath], (err) => {
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
            console.log(" update task param : ", params)
            db.queryParams("UPDATE task SET alias = $1 WHERE task_id = $2;", params, (err) => {
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

            db.queryParams("INSERT INTO group_info (task_id, group_id, cam_count ) VALUES ($1, $2, $3);", params, (err) => {
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
    console.log("insert new task request ", params)
    return new Promise((resolve, reject) => {
        db.getClient((errClient, client) => {
            if (errClient) {
                console.log("client connect err " + err)
                resolve(-1)
            }

            if (mode === 'cal') {
                db.queryParams("INSERT INTO task_request (request_category, task_id, group_id, job_id ) VALUES ($1, $2, $3, $4) RETURNING request_id;", params, (err, res) => {
                    client.release(true);
                    if (err) {
                        console.log(err)
                        resolve(-1)
                    }
                    console.log('insertNewTaskRequest cal query success');

                    if (res.rows.length > 0) {
                        console.log('current request_id ' + res.rows[0]['request_id']);
                        resolve(res.rows[0]['request_id'])
                    }
                    else {
                        resolve(-10)
                    }

                }, client);
            } else if (mode === 'gen') {
                console.log("insert request ", params[3])
                db.queryParams("INSERT INTO task_request (request_category, task_id, group_id, job_id, pts_2d, pts_3d, world ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING request_id;", params, (err, res) => {
                    client.release(true);
                    if (err) {
                        console.log(err)
                        resolve(-1)
                    }
                    console.log('insertNewTaskRequest gen query success');
                    if (res.rows.length > 0) {
                        console.log('current request_id ' + res.rows[0]['request_id']);
                        resolve(res.rows[0]['request_id'])
                    }
                    else {
                        resolve(-10)
                    }

                }, client);

            } else if (mode === 'tracking') {
                console.log("insert request ", params[3])
                db.queryParams("INSERT INTO task_request (request_category, task_id, group_id, job_id, pts_2d ) VALUES ($1, $2, $3, $4, $5) RETURNING request_id;", params, (err, res) => {
                    client.release(true);
                    if (err) {
                        console.log(err)
                        resolve(-1)
                    }
                    console.log('insertNewTaskRequest tracking query success');
                    if (res.rows.length > 0) {
                        console.log('current request_id ' + res.rows[0]['request_id']);
                        resolve(res.rows[0]['request_id'])
                    }
                    else {
                        resolve(-10)
                    }

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

exports.getGroupStatus = function (groupno) {
    return new Promise((resolve, reject) => {
        db.getClient((errClient, client) => {
            if (errClient) {
                console.log("client connect err " + err)
                reject(-1)
            }

            db.queryParams("SELECT a.request_id, a.job_id from task_request as a \
            LEFT OUTER JOIN group_info as b \
            on a.task_id = b.task_id and a.group_id = b.group_id \
            WHERE b.no = $1 and a.request_category = 'CALCULATE' and a.job_result != '-25'; ", [groupno], (err, res) => {
                client.release(true);
                if (err) {
                    console.log(err)
                    reject(-1);
                }
                else {
                    if (res.rows.length == 1) {
                        console.log('get GroupInfo query success ' + res.rows[0].request_id);
                        resolve(res.rows)
                    }
                    else if (res.rows.length == 0) {
                        console.log('get GroupInfo query success no rows.');
                        resolve(0)
                    }
                    else {
                        console.log("get groupStatus no err or multi ")
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

            db.query("SELECT a.task_no, a.task_id, a.createdate, a.alias, a.task_path, count(distinct b.request_id)\
            FROM task as a LEFT OUTER JOIN task_request as b \
            ON a.task_id = b.task_id \
            WHERE a.createdate > (SELECT current_date - 7) and a.task_id != '-1' \
            GROUP BY a.task_id ORDER BY a.task_no DESC;", (err, res) => {
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

            db.queryParams("SELECT task_id, request_id, request_category, group_id, createdate, job_id, job_status, job_result, job_message FROM task_request WHERE task_id = $1 ORDER BY request_id DESC; ", [taskId], (err, res) => {
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

exports.getGenJobId = function (request_ids) {
    return new Promise((resolve, reject) => {
        db.getClient((errClient, client) => {
            if (errClient) {
                console.log("client connect err " + err)
                reject(-1)
            }

            db.queryParams(`SELECT job_id, group_id FROM task_request WHERE request_id = ANY($1::int[]); `, [request_ids], (err, res) => {
                client.release(true);
                if (err) {
                    console.log(err)
                    reject(-1);
                }
                else {
                    if (res.rows.length > 0) {
                        console.log('get GetJobid query success ' + res.rows);
                        resolve(res.rows)
                    }
                    else {
                        console.log("get GenJobid query no rows ")
                        reject(-10)
                    }
                }
            }, client);
        });
    });
}

exports.getFullPath = function (request_id) {
    return new Promise((resolve, reject) => {
        db.getClient((errClient, client) => {
            if (errClient) {
                console.log("client connect err " + err)
                reject(-1)
            }
            let genJobId = []

            db.queryParams(`SELECT a.task_path FROM task as a \
            LEFT OUTER JOIN task_request as b \
            on a.task_id = b.task_id WHERE b.request_id = $1; `, [request_id], (err, res) => {
                client.release(true);
                if (err) {
                    console.log(err)
                    reject(-1);
                }
                else {
                    if (res.rows.length > 0) {
                        console.log('get full path query success ' + res.rows[0]);
                        resolve(res.rows[0].task_path)
                    }
                    else {
                        console.log("get fullpath query no rows ")
                        reject(-10)
                    }
                }
            }, client);
        });
    });
}

exports.getReviewImages = function (request_id) {
    return new Promise((resolve, reject) => {
        db.getClient((errClient, client) => {
            if (errClient) {
                console.log("client connect err " + err)
                reject(-1)
            }

            db.queryParams("SELECT job_id, pts_2d, pts_3d, world FROM task_request WHERE request_id = $1; ", [request_id], (err, res) => {
                client.release(true);
                if (err) {
                    console.log(err)
                    reject(-1);
                }
                else {
                    if (res.rows.length === 1) {
                        console.log('get generated job query success ' + res.rows[0].job_id);
                        resolve(res.rows)
                    }
                    else if (res.rows.length == 0) {
                        console.log('get generated job query fail - no rows.');
                        reject(-1)
                    }
                    else {
                        console.log("get groupStatus no err or multi ")
                        reject(-10)
                    }
                }

            }, client);

        });
    });
}

exports.createMultiTracker = function (tr_taskId, taskId, camCount) {
    return new Promise((resolve, reject) => {

        db.getClient((errClient, client) => {
            if (errClient) {
                console.log("client connect err " + err)
                resolve(-1)
            }

            db.queryParams("INSERT INTO multi_tracker (tracker_task_id ,task_id, cam_count) VALUES ($1, $2, $3);", [tr_taskId, taskId, camCount], (err) => {
                client.release(true);
                if (err) {
                    console.log(err)
                    resolve(-1);
                }
                console.log('insert new Tracker query success');
                resolve(0)
            }, client);
        });
    });
}

exports.updateMultiTracker = function (tr_taskId, info_map) {
    return new Promise((resolve, reject) => {

        db.getClient((errClient, client) => {
            if (errClient) {
                console.log("client connect err " + err)
                resolve(-1)
            }

            db.queryParams("UPDATE multi_tracker SET info_map = $1 where tracker_task_id = $2;", [tr_taskId, info_map], (err) => {
                client.release(true);
                if (err) {
                    console.log(err)
                    resolve(-1);
                }
                console.log('updateMultiTracker query success');
                resolve(0)
            }, client);
        });
    });
}