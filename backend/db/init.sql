{
    "create_task": "CREATE TABLE IF NOT EXISTS task (task_id TEXT PRIMARY KEY NOT NULL, createdate TIMESTAMP DEFAULT NOW(), task_path TEXT, group_count INTEGER, event_id TEXT);",
    "create_task_request": "CREATE TABLE IF NOT EXISTS task_request (subtask_id TEXT PRIMARY KEY NOT NULL, task_id TEXT, group_id TEXT, cam_count INTEGER, createdate TIMESTAMP DEFAULT NOW(), job_id INTEGER, job_status INTEGER, job_result TEXT, pts_result JSON, cancel_date TIMESTAMP);",
    "create_groupinfo": "CREATE TABLE IF NOT EXISTS group_info (task_id TEXT PRIMARY KEY, group_id TEXT, cam_count INTEGER);"
}