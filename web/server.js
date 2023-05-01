const express = require("express");
const app = express();

const port = 3000;
const base = `${__dirname}/public`;
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const { initializingPassport, isAuthenticated } = require('./passportconfig');

const cors = require('cors');

// Middleware for parsing JSON in request body
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(cors());
initializingPassport(passport);

// Allow DELETE method
app.use((req, res, next) => {
res.header('Access-Control-Allow-Methods', 'DELETE');
next();
});

app.use(express.static("public"));

app.get("/", function (req, res) {
  res.sendFile(`${base}/Landing.html`);
});

app.get("/admin", function (req, res) {
  res.sendFile(`${base}/administrator.html`);
});

app.get("/occupancy", function (req, res) {
  res.sendFile(`${base}/occupancy.html`);
});

app.get("/pdf", function (req, res) {
  res.sendFile(`${base}/_pdf.html`);
});

app.get("/student", function (req, res) {
  res.sendFile(`${base}/student.html`);
});


app.get("/ex", function (req, res) {
  res.sendFile(`${base}/excel_c.html`);
});

app.get("/teacher", function (req, res) {
  res.sendFile(`${base}/teacher.html`);
});

app.get("/feedback", function (req, res) {
  res.sendFile(`${base}/feedback.html`);
});

app.get("/prot", isAuthenticated,function (req, res) {
  res.send('yoo protected');
});

app.get("/coordinator", function (req, res) {
  res.sendFile(`${base}/coordinator.html`);
});

app.get("/manageUser", function (req, res) {
  res.sendFile(`${base}/manageUsers.html`);
});

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });
// Handle all other routes with a 404 page
app.get("*", function (req, res) {
  res.sendFile(`${base}/404.html`);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
