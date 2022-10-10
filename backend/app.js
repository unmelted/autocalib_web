const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const route_file = require('./routes/files')
const route_api = require('./routes/exodus_api')
const route_control = require('./routes/control_api')
const path = require("path");
const app = express()

const node_env = "local"; //process.env.NODE_ENV || "development"
let envPath = "";
switch (node_env) {
  case "local":
    envPath = ".env.local";
    break;
  case "development":
    envPath = ".env.development";
    break;
  case "production":
    envPath = ".env.production";
    break;
  default:
    envPath = ".env.development";
}

console.log("Environment Path is: ", envPath);
require("dotenv").config({
  path: path.join(__dirname, envPath),
});

console.log("Verify ENV: ", process.env.AUTO_CALIB_DIR, process.env.AUTO_CALIB_EXODUS_URL);

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
)
app.use(cors({
  origin: '*'
}))
app.use('/public', express.static('public'))
app.use('/file', route_file)
app.use('/api', route_api)
app.use('/control', route_control)
app.get('/favicon.ico', (req, res) => res.status(204));
const port = process.env.PORT || 4000
const server = app.listen(port, () => {
  console.log('Connected to port ' + port)
})
app.use((req, res, next) => {
  // Error goes via `next()` method
  setImmediate(() => {
    next(new Error('Something went wrong'))
  })
})
app.use(function (err, req, res, next) {
  console.error(err.message)
  if (!err.statusCode) err.statusCode = 500
  res.status(err.statusCode).send(err.message)
})

module.exports = app;
