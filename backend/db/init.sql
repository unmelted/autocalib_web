CREATE TABLE IF NOT EXISTS task (task_no INTEGER NOT NULL, task_id TEXT PRIMARY KEY NOT NULL, createdate TIMESTAMP DEFAULT NOW(), task_path TEXT, group_count INTEGER, event_id TEXT);

CREATE TABLE IF NOT EXISTS task_request (request_id SERIAL PRIMARY KEY NOT NULL, request_category TEXT, task_id TEXT, group_id TEXT, createdate TIMESTAMP DEFAULT NOW(), job_id INTEGER, job_status INTEGER, job_result TEXT, job_message TEXT, pts_result JSON, cancel_date TIMESTAMP);

CREATE TABLE IF NOT EXISTS group_info (no SERIAL PRIMARY KEY ,task_id TEXT, group_id TEXT, cam_count INTEGER);
