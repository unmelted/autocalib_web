module.exports = {
    apps: [{
        name: 'auto_calib_back',
        script: './bin/www',
        instances: 0,
        exec_mode: 'cluster',
        autorestart: true,
        watch: true,
        ignore_watch: ["./logs/*", "./public/images/*"],
        max_memory_restart: '200M',
        wait_ready: true,
        listen_timeout: 50000,
        log_date_format : "YY-MM-DD HH:mm:ss Z",
        error_file : "./logs/auto_calib_back.log",
        out_file : "./logs/auto_calib_back.log",
        merge_logs: true
    }]
}