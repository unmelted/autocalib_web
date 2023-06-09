
const { Pool } = require('pg')
const { configdb } = require("./config.js")

const pool = new Pool(configdb)
pool.connect()

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error(err);
        return;
    }

    console.log('Connection successful');
});


module.exports = {
    async query(text, callback, client) {
        return await client.query(text, (err, res) => {
            callback(err, res);
        });
    },
    async queryParams(text, params, callback, client) {
        console.log("queryPaarams : ", text)
        return await client.query(text, params, (err, res) => {
            callback(err, res)
        });
    },
    async getClient(callback) {
        return client = await pool.connect((err, client, done) => {
            callback(err, client, done)
        });
    }
}