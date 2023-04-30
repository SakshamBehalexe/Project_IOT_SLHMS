const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require('bcrypt');
const router = express.Router();

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
// const User = require("./model/user/user");
const app = express();
const mqtt = require('mqtt');
const cors = require('cors');

mongoose.connect("mongodb+srv://armaan:armaan@cluster0.paruxml.mongodb.net/SmartLectureHall", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

app.use(cors());

//[this is the mqtt broker]
const client = mqtt.connect('mqtt://broker.mqttdashboard.com');

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

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
}, { collection : 'User_1' });

const User = mongoose.model("User", userSchema);

// Schema and Model for Lecture Hall Bookings
const bookingSchema = new mongoose.Schema({
  lh: {
    type: String,
    required: true
  },
  teacherName: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    required: true
  },
  pdfFile: {
    data: Buffer,
    contentType: String
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
});

const Booking = mongoose.model('Booking', bookingSchema);


app.get("/test", (req, res) => {
  res.send("Hello World!");
});

// Define API route for getting the most recent booking
app.get('/bookings/recent', async (req, res) => {
  try {
    const booking = await Booking.findOne({}).sort({ createdDate: -1 }).exec();
    res.json(booking);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error retrieving booking from database.');
  }
});



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

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email, password })
    .then(user => {
      if (!user) {
        return res.status(401).send({ message: 'Incorrect username or password. Please try again.' });
      }
    })
    .catch(err => {
      console.error(err);
      return res.status(500).send({ message: 'Internal server error.' });
    });
});

app.post('/bookings', upload.single('pdfFile'), async (req, res) => {
  const { lh, teacherName, course, explanation } = req.body;
  const pdfFile = { data: req.file.buffer, contentType: req.file.mimetype };

  try {
    const booking = await Booking.create({ lh, teacherName, course, explanation, pdfFile });
    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});


const excelSchema = new mongoose.Schema({
  excelFile: {
    data: Buffer,
    contentType: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Excel = mongoose.model('Excel', excelSchema);

app.post('/timetable', upload.single('file'), async (req, res) => {
  try {
    const newExcel = new Excel({
      excelFile: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      }
    });

    const excel = await newExcel.save();
    console.log('Excel file saved successfully:', excel);
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

// Define the feedback schema
const feedbackSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String
});

// Define the feedback model
const Feedback = mongoose.model('Feedback', feedbackSchema);

// Handle the POST request to /feedback
app.post('/feedback', async (req, res) => {
  try {
    // Create a new feedback object from the request body
    const feedback = new Feedback({
      name: req.body.name,
      email: req.body.email,
      message: req.body.message
    });

    // Save the feedback object to the database
    await feedback.save();

    res.send('Feedback saved');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving feedback');
  }
});

// Handle GET request to /feedback to retrieve all feedback data
app.get('/feedback', async (req, res) => {
  try {
    const feedback = await Feedback.find();
    res.json(feedback);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving feedback');
  }
});

// Handle DELETE request to /feedback/:id to delete a specific feedback
app.delete('/feedback/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).send('Feedback not found');
    }
    res.send('Feedback deleted');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting feedback');
  }
});



// Get the three most recent bookings
app.get('/bookings', async function(req, res) {
	try {
		const bookings = await Booking.find().sort({createdDate: -1}).limit(3).exec();
		res.send(bookings);
	} catch (err) {
		console.error(err);
		res.status(500).send('Error retrieving bookings');
	}
});

app.get('/pdf/:bookingId', async function(req, res) {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking || !booking.pdfFile || booking.pdfFile.contentType !== 'application/pdf') {
      res.status(404).send('PDF not found');
      return;
    }
    res.contentType('application/pdf');
    res.send(booking.pdfFile.data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving PDF');
  }
});



app.get('/timetable', async (req, res) => {
  try {
    const excel = await Excel.findOne().sort('-createdAt').exec();
    if (!excel) {
      res.status(404).send('No excel file found');
    } else {
      res.setHeader('Content-Type', excel.excelFile.contentType);
      res.setHeader('Content-Disposition', 'attachment; filename=' + 'timetable.xlsx');
      res.send(excel.excelFile.data);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

// Logout endpoint
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).send('Logged out successfully');
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

