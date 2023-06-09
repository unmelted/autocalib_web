
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
            db.queryParams("UPDATE task SET alias = $1, wherefrom = $2 WHERE task_id = $3;", params, (err) => {
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

            db.query("SELECT a.task_no, a.task_id, a.createdate, a.alias, a.task_path, count(distinct b.request_id), a.wherefrom \
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

exports.selectTrackerDatewithinRange = function () {
    return new Promise((resolve, reject) => {
        db.getClient((errClient, client) => {
            if (errClient) {
                console.log("client connect err " + err)
                resolve(-1);
            }

            db.query("SELECT tracker_task_id, task_id, createdate, kairos_task_id, command_status, run_status \
            FROM multi_tracker \
            WHERE createdate > (SELECT current_date - 7) \
            ORDER BY tracker_task_id DESC;", (err, res) => {
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
                        // reject(-10)
                        resolve([])
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
                resolve(-1, 0)
            }

            db.queryParams("INSERT INTO multi_tracker (tracker_task_id ,task_id, cam_count, command_status) VALUES ($1, $2, $3, $4);", [tr_taskId, taskId, camCount, 'created'], (err) => {
                if (err) {
                    console.log(err)
                    resolve(-1, 0);
                }
                else {
                    db.queryParams("SELECT job_id from task_request WHERE task_id = $1 and request_category = 'GENERATE' and job_result = '100' and job_status ='100';", [taskId], (err, res) => {
                        client.release(true);
                        if (err) {
                            console.log(err)
                            resolve(-1, 0)
                        }
                        if (res.rows.length > 0) {
                            console.log('select exodus job id query success', res.rows);
                            resolve(0, res.rows)
                        }
                        else {
                            console.log("updateTaskRequest query no rows ")
                            resolve(-10, 0)
                        }
                    }, client);
                }
            }, client);
        });
    });
}

exports.updateMultiTrackerMap = function (tr_taskId, info_map) {
    return new Promise((resolve, reject) => {

        db.getClient((errClient, client) => {
            if (errClient) {
                console.log("client connect err " + err)
                resolve(-1)
            }

            db.queryParams("UPDATE multi_tracker SET info_map = $2 where tracker_task_id = $1;", [tr_taskId, JSON.stringify(info_map)], (err) => {
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

exports.updateMultiTracker = function (tr_taskId, type, data) {
    return new Promise((resolve, reject) => {

        db.getClient((errClient, client) => {
            if (errClient) {
                console.log("client connect err " + err)
                resolve(-1)
            }

            console.log("updateMultiTracker start ", tr_taskId, type, data)

            if (type === 'job_id') {
                console.log("updateMultiTracker job_id update : ", tr_taskId, typeof tr_taskId, data, typeof data)
                db.queryParams("UPDATE multi_tracker SET kairos_task_id = $2, command_status ='ready' where tracker_task_id = $1;", [tr_taskId, data], (err) => {
                    client.release(true);
                    if (err) {
                        console.log(err)
                        resolve(-1);
                    }
                    console.log('updateMultiTracker job_id update success');
                    resolve(0)

                }, client)
            }
            else if (type === 'status') {
                console.log("updateMultiTracker command status update : ", tr_taskId, data)
                db.queryParams("UPDATE multi_tracker SET command_status = $2 where tracker_task_id = $1;", [tr_taskId, data], (err) => {
                    client.release(true);
                    if (err) {
                        console.log(err)
                        resolve(-1);
                    }
                    console.log('updateMultiTracker command status update success');
                    resolve(0)
                }, client)
            }
            else if (type === 'run_status') {
                console.log("updateMultiTracker run statue update : ", tr_taskId, data)
                db.queryParams("UPDATE multi_tracker SET run_status = $2 where tracker_task_id = $1;", [tr_taskId, data], (err) => {
                    client.release(true);
                    if (err) {
                        console.log(err)
                        resolve(-1);
                    }
                    console.log('updateMultiTracker run_status update success');
                    resolve(0)
                }, client)
            }
        });
    });
};

exports.getTrackerInfoMap = async function (taskId) {
    return new Promise((resolve, reject) => {
        db.getClient((errClient, client) => {
            if (errClient) {
                console.log("client connect err " + err)
                reject(-1)
            }

            db.queryParams(`SELECT info_map FROM multi_tracker WHERE tracker_task_id = $1; `, [taskId], (err, res) => {
                client.release(true);
                if (err) {
                    console.log(err)
                    reject(-1);
                }
                else {
                    if (res.rows.length == 1) {
                        console.log('get infomap query success ' + res.rows[0], res.rows[0].info_map);
                        resolve(res.rows[0])
                    }
                    else {
                        console.log("get infomap query no rows ")
                        reject(-10)
                    }
                }
            }, client);
        });
    });
}

exports.getCalibJobId = async function (task_id, info_map) {

    return new Promise((resolve, reject) => {

        db.getClient((errClient, client) => {
            if (errClient) {
                console.log("client connect err " + err)
                resolve(-1, 0)
            }

            const promises = []; // Array to store promises

            for (const cam of Object.keys(info_map)) {
                group = info_map[cam].group
                cg = group.charAt(0).toUpperCase() + group.slice(1);
                console.log("query param : ", cam, task_id, cg)

                const queryPromise = new Promise((resolveQuery, rejectQuery) => {
                    db.queryParams(
                        "SELECT a.job_id FROM task_request as a INNER JOIN multi_tracker as b on a.task_id = b.task_id WHERE tracker_task_id = $1 and group_id = $2 and request_category = 'GENERATE' and job_result = '100' and job_status = '100';",
                        [task_id, cg],
                        (err, res) => {
                            if (err) {
                                console.log(err);
                                resolveQuery(-1);
                            }
                            if (res.rows.length > 0) {
                                console.log("get calib job id query success :", res.rows[0].job_id);
                                resolveQuery(res.rows[0].job_id);
                            } else {
                                console.log("get calib job id query no rows ");
                                resolveQuery(-10);
                            }
                        },
                        client
                    );
                });

                promises.push(queryPromise); // Add the query promise to the array
            }

            Promise.all(promises)
                .then((results) => {
                    const calib_job_id = {};
                    for (let i = 0; i < Object.keys(info_map).length; i++) {
                        const cam = Object.keys(info_map)[i];
                        calib_job_id[cam] = results[i];
                    }
                    console.log("return calib_job_id:", calib_job_id);
                    resolve({ code: 0, data: calib_job_id }); // Resolve with a single value or object
                })
                .catch((error) => {
                    console.error("An error occurred:", error);
                    resolve({ code: -1, data: 0 }); // Resolve with a single value or object
                });
        });
    });
};