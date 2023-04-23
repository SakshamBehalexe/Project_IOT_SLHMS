const express = require("express");
const User = require("./model/user/user");
const app = express();
const mqtt = require('mqtt');
const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://armaan:armaan@cluster0.paruxml.mongodb.net/SmartLectureHall",
  { useNewUrlParser: true, useUnifiedTopology: true }
);



const bodyParser = require("body-parser");
const session = require("express-session");
const crypto = require("crypto");
const fs = require("fs");

const cors = require('cors');

app.use(cors());

//[this is the mqtt broker]
const client  = mqtt.connect('mqtt://broker.mqttdashboard.com');

// Allow DELETE method
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'DELETE');
  next();
});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = 5004;
// CRUD endpoints for User model
// Create a new user

app.get("/test", (req, res) => 
{
  res.send("Hello World!");
}
);


app.post("/users", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const newUser = new User({ name, email, password });
    await newUser.save();
    res.status(201).send(newUser);
  } catch (err) {
    res.status(400).send(err);
  }
});


// Read all users (GET)
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).send(users);
  } catch (err) {
    res.status(500).send(err);
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});