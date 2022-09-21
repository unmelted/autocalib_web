
var db = require('../db/index.js')


exports.insertNewTask = function (taskPath, fullPath) {
    db.getClient((errClient, client) => {
        if (errClient) {
            console.log("client connect err " + err)
            return -1;
        }

        db.queryParams("INSERT INTO task (task_id, task_path ) VALUES ($1, $2)", [taskPath, fullPath], (err) => {
            client.end();
            if (err) {
                console.log(err)
                return -1;
            }
            console.log('insertNewTask query success');
            return 0
        }, client);

    });
}

exports.updatetTask = function (params) {
    db.getClient((errClient, client) => {
        if (errClient) {
            console.log("client connect err " + err)
            return -1;
        }

        db.queryParams("UPDATE task SET (group_count = $1 ) WHERE task_id = $2", params, (err) => {
            client.end();
            if (err) {
                console.log(err)
                return -1;
            }
            console.log('updateTask query success');
            return 0
        }, client);

    });
}

exports.insertNewGroupInfo = function (params) {
    db.getClient((errClient, client) => {
        if (errClient) {
            console.log("client connect err " + err)
            return -1;
        }

        db.queryParams("INSERT INTO group_info (task_id, group_id, cam_count ) VALUES ($1, $2, $3)", params, (err) => {
            client.end();
            if (err) {
                console.log(err)
                return -1;
            }
            console.log('insertNewGroupInfo query success');
            return 0
        }, client);

    });
}


exports.insertNewTaskRequest = function (params) {
    db.getClient((errClient, client) => {
        if (errClient) {
            console.log("client connect err " + err)
            return -1;
        }

        db.queryParams("INSERT INTO task_request (subtask_id, task_id, group_id, cam_count ) VALUES ($1, $2, $3)", params, (err) => {
            client.end();
            if (err) {
                console.log(err)
                return -1;
            }
            console.log('insertNewGroupInfo query success');
            return 0
        }, client);

    });
}

exports.updateTaskRequest = function (params) {
    db.getClient((errClient, client) => {
        if (errClient) {
            console.log("client connect err " + err)
            return -1;
        }

        db.queryParams("UPDATE task_request (job_id = $1 ) where subtask_id = $2; ", params, (err) => {
            client.end();
            if (err) {
                console.log(err)
                return -1;
            }
            console.log('insertNewGroupInfo query success');
            return 0
        }, client);

    });
}
