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
    const newUser = new User(req.body);
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

// Read a user by ID
app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).send();
    } else {
      res.status(200).send(user);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

// Update a user by ID
app.patch("/users/:id", async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["username", "password", "role"];
  const isValidUpdate = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdate) {
    return res.status(400).send({ error: "Invalid updates" });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).send();
    } else {
      updates.forEach((update) => (user[update] = req.body[update]));
      await user.save();
      res.status(200).send(user);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

// Delete a user by ID
app.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).send();
    } else {
      res.status(200).send(user);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});