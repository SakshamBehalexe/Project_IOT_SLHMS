const mongoose = require('mongoose');
const mqtt = require('mqtt');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Connect to MongoDB
mongoose.connect("mongodb+srv://armaan:armaan@cluster0.paruxml.mongodb.net/Sensor", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

const cors = require('cors');
app.use(cors());

// Allow DELETE method
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'DELETE');
  next();
});

const port = 5008;

const mqttLink = "http://localhost:5008"

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

const client = mqtt.connect('mqtt://broker.hivemq.com:1883');

const statusSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },

  createdDate: {
    type: Date,
    default: Date.now
  }
});

const Status = mongoose.model('slhms_status', statusSchema);

app.get('/testing', async (req, res) => {
  res.send("Testing");
});

client.on('connect', () => { 
  console.log('MQTT connected');
  client.subscribe('lecturehall/status');
});

app.post('/lecturehall/status', async (req, res) => {
  const { status } = req.body;
  
  const newStatus = new Status({ status });
  await newStatus.save();
  
  client.publish('lecturehall/status', JSON.stringify({ status }));
  
  res.send("Status updated successfully");
});

app.listen(port, () => { 
  console.log(`listening on port ${port} link to the mqtt server ${mqttLink}`);
});


