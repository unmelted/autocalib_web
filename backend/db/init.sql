CREATE TABLE IF NOT EXISTS task (task_no INTEGER NOT NULL, task_id TEXT PRIMARY KEY NOT NULL, createdate TIMESTAMP DEFAULT NOW(), task_path TEXT, group_count INTEGER, event_id TEXT, alias TEXT);

CREATE TABLE IF NOT EXISTS task_request (request_id SERIAL PRIMARY KEY NOT NULL, request_category TEXT, task_id TEXT, group_id TEXT, createdate TIMESTAMP DEFAULT NOW(), job_id INTEGER, job_status INTEGER, job_result TEXT, job_message TEXT, pts_2d INTEGER[], pts_3d INTEGER[], cancel_date TIMESTAMP);

CREATE TABLE IF NOT EXISTS group_info (no SERIAL PRIMARY KEY ,task_id TEXT, group_id TEXT, cam_count INTEGER);

CREATE TABLE IF NOT EXISTS pts_result (request_id INTEGER PRIMARY KEY, gen_pts JSON);

INSERT INTO task (task_no, task_id, task_path ) VALUES (100, -1, -1);