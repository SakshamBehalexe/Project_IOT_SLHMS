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

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

const statusSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    required: true
  },

  createdDate: {
    type: Date,
    default: Date.now
  }
});

const Status = mongoose.model('slhms_status', statusSchema);

//schema for temperature
const Temperature = mongoose.model('Temperature', new mongoose.Schema({

  tempValue: {
     type: Number
   },
  HumValue: {
     type: Number
   },
   recordedAt: {
     type: Date,
     default: Date.now

   }}, { collection : 'Temperature_2' }));



   const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

app.get('/testing', async (req, res) => {
  res.send("Testing");
});

client.on('connect', () => { 
  console.log('MQTT connected');
});

const port = 5008;

client.on('message', async (topic, message)=> {
  if (topic === "temp_slhm") {
    console.log(`Received message on topic "${topic}": ${message.toString()}`);
    // Parse the message payload
    const data = JSON.parse(message);

    // Save temperature data to MongoDB using Mongoose
    const newTemperature = new Temperature({
      tempValue: data.temperature,
      HumValue: data.humidity,
      recordedAt: Date.now()
    });

    try {
      await newTemperature.save();
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


