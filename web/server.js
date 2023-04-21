const express = require("express");
const app = express();

const port = 3000;
const base = `${__dirname}/public`;
const bodyParser = require("body-parser");

const cors = require('cors');

// Middleware for parsing JSON in request body
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(cors());

// Allow DELETE method
app.use((req, res, next) => {
res.header('Access-Control-Allow-Methods', 'DELETE');
next();
});

app.use(express.static("public"));

app.get("/", function (req, res) {
  res.sendFile(`${base}/login.html`);
});

app.get('/send-command', (req, res) => {
  res.sendFile(`${base}/send-command.html`);
  });

app.get("/student", function (req, res) {
  res.sendFile(`${base}/student.html`);
});

app.get("/admin", function (req, res) { 
  res.sendFile(`${base}/admin.html`);
});

app.get("/excel_c", function (req, res) {
  res.SendFile(`${base}/excel_c.html`);
});

app.get("/teacher", function (req, res) {
  res.sendFile(`${base}/teacher.html`);
});

// Handle all other routes with a 404 page
app.get("*", function (req, res) {
  res.sendFile(`${base}/404.html`);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
