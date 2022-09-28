
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

            db.queryParams("INSERT INTO task (task_no, task_id, task_path ) VALUES ($1, $2, $3)", [taskNo, taskPath, fullPath], (err) => {
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

exports.updatetTask = function (params) {
    return new Promise((resolve, reject) => {
        db.getClient((errClient, client) => {
            if (errClient) {
                console.log("client connect err " + err)
                resolve(-1)
            }

            db.queryParams("UPDATE task SET (group_count = $1 ) WHERE task_id = $2", params, (err) => {
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


exports.insertNewTaskRequest = function (params) {
    return new Promise((resolve, reject) => {
        db.getClient((errClient, client) => {
            if (errClient) {
                console.log("client connect err " + err)
                resolve(-1)
            }

            db.queryParams("INSERT INTO task_request (request_category, task_id, group_id, job_id ) VALUES ($1, $2, $3, $4)", params, (err) => {
                // client.release(true);
                if (err) {
                    console.log(err)
                    resolve(-1)
                }
                console.log('insertNewTaskRequest query success');

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

        });
    });
}

exports.updateTaskRequest = function (params) {
    return new Promise((resolve, reject) => {
        db.getClient((errClient, client) => {
            if (errClient) {
                console.log("client connect err " + err)
                resolve(-1)
            }

            db.queryParams("UPDATE task_request (job_id = $1 ) where subtask_id = $2; ", params, (err) => {
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