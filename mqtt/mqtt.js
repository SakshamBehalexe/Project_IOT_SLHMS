const mongoose = require('mongoose');
const mqtt = require('mqtt');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Connect to MongoDB
mongoose.connect("mongodb+srv://armaan:armaan@cluster0.paruxml.mongodb.net/Sensor?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

const cors = require('cors');
app.use(cors());

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

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

//schema for temperature

const Temperature = mongoose.model('Temperature', new mongoose.Schema({
  id: String,
  name: String,
  location: String,
  temperature: Number
}, { collection : 'Temperature_1' }));

const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

client.on('connect', () => { 
  console.log('MQTT connected');
});

const port = 5008;

// Connect to MQTT broker
client.on('connect', function () {
  console.log('Connected to MQTT broker');

  // Subscribe to the "temp_slhms" topic
  client.subscribe('temp_slhms', function (err) {
    if (err) {
      console.error(err);
    } else {
      console.log('Subscribed to the "temp_slhms" topic');
    }
  });
});

client.on('message', async (topic, message)=> {
  if (topic === 'temp_slhms') {
    console.log(`Received message on topic "${topic}": ${message.toString()}`);
    
    // Parse the message payload
    const data = JSON.parse(message);

    // Save temperature data to MongoDB using Mongoose
    const newTemperature = new Temperature({
      id: data.device_id,
      name: data.name,
      location: data.location,
      temperature: data.temperature
    });

    try {
      await newTemperature.save({ writeConcern: { w: "majority" }, timeout: 20000 });
      console.log(`Temperature data saved to MongoDB`);
    } catch (err) {
      console.error(`Error saving temperature data to MongoDB: ${err}`);
      if (err.errors) {
        console.error(`Validation errors: ${err.errors}`);
      }
    }
  }
});


app.listen(port, () => { 
  console.log(`listening on port ${port}`);
});


