module.exports = function (app) 
{

    const mongoose = require("mongoose");
    const express = require("express");
    const bodyParser = require("body-parser");
    const session = require("express-session");
    const LocalStrategy = require("passport-local").Strategy;


    const multer = require('multer');
    const storage = multer.memoryStorage();
    const upload = multer({ storage });
    // const User = require("./model/user/user");
    const mqtt = require('mqtt');
    const cors = require('cors');

    mongoose.connect("mongodb+srv://armaan:armaan@cluster0.paruxml.mongodb.net/SmartLectureHall", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log(err));

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

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    

    // #swagger.tags = ['Booking']
    // #swagger.description = 'Endpoint to get the most recent booking.'
    app.get('/bookings/recent', async (req, res) => {
        try {
            /* #swagger.responses[200] = { 
                schema: { $ref: "#/definitions/Booking" },
                description: 'The most recent booking.' 
            } */
            const booking = await Booking.findOne({}).sort({ createdDate: -1 }).exec();
            res.json(booking);
        } catch (err) {
            console.log(err);
            /* #swagger.responses[500] = { 
                description: 'Error retrieving booking from database.' 
            } */
            res.status(500).send('Error retrieving booking from database.');
        }
    });

    // #swagger.tags = ['User']
    // #swagger.description = 'Endpoint to create a new user.'
    app.post("/users", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const newUser = new User({ name, email, password });
        await newUser.save();
        /* #swagger.responses[201] = { 
            schema: { $ref: "#/definitions/User" },
            description: 'User created successfully.' 
        } */
        res.status(201).send(newUser);
    } catch (err) {
        /* #swagger.responses[400] = { 
            description: 'Bad request.' 
        } */
        res.status(400).send(err);
    }
    });
    
    // #swagger.tags = ['User']
    // #swagger.description = 'Endpoint to get all users.'
    app.get("/users", async (req, res) => {
        try {
        /* #swagger.responses[200] = { 
            schema: {
                type: 'array',
                items: { $ref: '#/definitions/User' }
            },
            description: 'List of all users.' 
        } */
        const users = await User.find({});
        res.status(200).send(users);
        } catch (err) {
        /* #swagger.responses[500] = { 
            description: 'Error retrieving users from database.' 
        } */
        res.status(500).send(err);
        }
    });

    // #swagger.tags = ['User']
    // #swagger.description = 'Endpoint to delete a user by ID.'
    app.delete("/users/:id", async (req, res) => {
        try {
        /* #swagger.parameters['id'] = { description: 'User ID.' } */
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
        /* #swagger.responses[404] = {
        description: 'User not found.'
        } */
        return res.status(404).send({ error: "User not found" });
        }
        /* #swagger.responses[200] = {
        schema: { $ref: "#/definitions/User" },
        description: 'User deleted successfully.'
        } */
        res.status(200).send(deletedUser);
        } catch (err) {
        /* #swagger.responses[500] = {
        description: 'Internal server error.'
        } */
        res.status(500).send(err);
        }
    });

    // #swagger.tags = ['Authentication']
    // #swagger.description = 'Endpoint to log in a user.'
    app.post('/login', async (req, res) => {
        const { name, email, password } = req.body;
        try {
        const user = await User.findOne({ name, email, password });
        if (!user) {
            /* #swagger.responses[401] = { 
                description: 'Incorrect username, email or password.' 
            } */
            return res.status(401).send({ message: 'Incorrect username, email or password. Please try again.' });
        }
        // If the user is found, you can add code here to create a session or token
        // and send it back in the response
        /* #swagger.responses[200] = { 
            description: 'User logged in successfully.' 
        } */
        return res.status(200).send({ message: 'User logged in successfully.' });
        } catch (err) {
        console.error(err);
        /* #swagger.responses[500] = { 
            description: 'Internal server error.' 
        } */
        return res.status(500).send({ message: 'Internal server error.' });
        }
    });
  
    // #swagger.tags = ['Products']
    // #swagger.tags = ['Booking']
    // #swagger.description = 'Endpoint to create a new booking.'
    app.post('/bookings', upload.single('pdfFile'), async (req, res) => {
        const { lh, teacherName, course, explanation } = req.body;
        const pdfFile = { data: req.file.buffer, contentType: req.file.mimetype };
    
        try {
        const booking = await Booking.create({ lh, teacherName, course, explanation, pdfFile });
        /* #swagger.responses[201] = {
            schema: { $ref: "#/definitions/Booking" },
            description: 'Booking created successfully.'
        } */
        res.status(201).json(booking);
        } catch (error) {
        console.error(error);
        /* #swagger.responses[500] = {
            description: 'Server error.'
        } */
        res.status(500).send('Server error');
        }
    });
  
    // #swagger.tags = ['Booking']
    // #swagger.description = 'Endpoint to delete a booking by ID.'
    app.delete('/bookings/:id', async (req, res) => {
        const id = req.params.id;
    
        try {
        const booking = await Booking.findById(id);
        if (!booking) {
            /* #swagger.responses[404] = {
            description: 'Booking not found.'
            } */
            return res.status(404).json({ message: 'Booking not found' });
        }
    
        await Booking.deleteOne({ _id: id });
        /* #swagger.responses[200] = {
            description: 'Booking deleted successfully.'
        } */
        res.status(200).json({ message: 'Booking deleted successfully' });
        } catch (error) {
        console.error(error);
        /* #swagger.responses[500] = {
            description: 'Server error.'
        } */
        res.status(500).send('Server error');
        }
    });

    // #swagger.tags = ['Timetable']
// #swagger.description = 'Endpoint to upload a timetable Excel file.'
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
      /* #swagger.responses[200] = { 
          description: 'Excel file saved successfully.' 
      } */
      res.sendStatus(200);
    } catch (err) {
      console.log(err);
      /* #swagger.responses[500] = { 
          description: 'Internal server error.' 
      } */
      res.sendStatus(500);
    }
  });
  
  
    // #swagger.tags = ['Feedback']
    // #swagger.description = 'Endpoint to save feedback.'

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
    
        /* #swagger.responses[200] = {
            description: 'Feedback saved successfully.'
        } */
        res.send('Feedback saved');
        } catch (err) {
        console.error(err);
        /* #swagger.responses[500] = {
            description: 'Internal server error.'
        } */
        res.status(500).send('Error saving feedback');
        }
    });
  
    // #swagger.tags = ['Feedback']
// #swagger.description = 'Endpoint to retrieve all feedback data.'

// Handle GET request to /feedback to retrieve all feedback data
app.get('/feedback', async (req, res) => {
    try {
      const feedback = await Feedback.find();
      /* #swagger.responses[200] = {
          schema: {
            $ref: "#/definitions/FeedbackArray"
          },
          description: 'Feedback data retrieved successfully.'
      } */
      res.json(feedback);
    } catch (err) {
      console.error(err);
      /* #swagger.responses[500] = {
          description: 'Internal server error.'
      } */
      res.status(500).send('Error retrieving feedback');
    }
  });
  
  // #swagger.tags = ['Feedback']
// #swagger.description = 'Endpoint to delete a specific feedback.'

// Handle DELETE request to /feedback/:id to delete a specific feedback
app.delete('/feedback/:id', async (req, res) => {
    try {
      const feedback = await Feedback.findByIdAndDelete(req.params.id);
      if (!feedback) {
        /* #swagger.responses[404] = {
          description: 'Feedback not found.'
        } */
        return res.status(404).send('Feedback not found');
      }
      /* #swagger.responses[200] = {
        description: 'Feedback deleted successfully.'
      } */
      res.send('Feedback deleted');
    } catch (err) {
      console.error(err);
      /* #swagger.responses[500] = {
        description: 'Internal server error.'
      } */
      res.status(500).send('Error deleting feedback');
    }
  });
  
  // #swagger.tags = ['Booking']
// #swagger.description = 'Endpoint to retrieve the three most recent bookings.'

// Get the three most recent bookings
app.get('/bookings', async function(req, res) {
	try {
		const bookings = await Booking.find().sort({createdDate: -1}).limit(3).exec();
		/* #swagger.responses[200] = {
			schema: {
				$ref: "#/definitions/BookingArray"
			},
			description: 'Bookings retrieved successfully.'
		} */
		res.send(bookings);
	} catch (err) {
		console.error(err);
		/* #swagger.responses[500] = {
			description: 'Internal server error.'
		} */
		res.status(500).send('Error retrieving bookings');
	}
});

// #swagger.tags = ['Booking']
// #swagger.description = 'Endpoint to retrieve all bookings.'

// Get all bookings
app.get('/bookings/all', async (req, res) => {
    try {
      const bookings = await Booking.find().sort({createdDate: -1}).exec();
      /* #swagger.responses[200] = {
          schema: {
            $ref: "#/definitions/BookingArray"
          },
          description: 'Bookings retrieved successfully.'
      } */
      res.send(bookings);
    } catch (err) {
      console.error(err);
      /* #swagger.responses[500] = {
          description: 'Internal server error.'
      } */
      res.status(500).send('Error retrieving bookings');
    }
  });

  // #swagger.tags = ['Booking']
// #swagger.description = 'Endpoint to retrieve the PDF file of a specific booking.'

app.get('/pdf/:bookingId', async function(req, res) {
    try {
      const booking = await Booking.findById(req.params.bookingId);
      if (!booking || !booking.pdfFile || booking.pdfFile.contentType !== 'application/pdf') {
        /* #swagger.responses[404] = {
              description: 'PDF not found.'
        } */
        res.status(404).send('PDF not found');
        return;
      }
      res.contentType('application/pdf');
      /* #swagger.responses[200] = {
              description: 'PDF file retrieved successfully.'
      } */
      res.send(booking.pdfFile.data);
    } catch (err) {
      console.error(err);
      /* #swagger.responses[500] = {
              description: 'Internal server error.'
      } */
      res.status(500).send('Error retrieving PDF');
    }
  });
  
  // #swagger.tags = ['Timetable']
// #swagger.description = 'Endpoint to retrieve the latest timetable in Excel format.'

app.get('/timetable', async (req, res) => {
    try {
      const excel = await Excel.findOne().sort('-createdAt').exec();
      if (!excel) {
        /* #swagger.responses[404] = {
          description: 'No excel file found.'
        } */
        res.status(404).send('No excel file found');
      } else {
        res.setHeader('Content-Type', excel.excelFile.contentType);
        res.setHeader('Content-Disposition', 'attachment; filename=' + 'timetable.xlsx');
        /* #swagger.responses[200] = {
          description: 'Timetable retrieved successfully.'
        } */
        res.send(excel.excelFile.data);
      }
    } catch (err) {
      console.error(err);
      /* #swagger.responses[500] = {
        description: 'Internal server error.'
      } */
      res.sendStatus(500);
    }
  });

  // #swagger.tags = ['Auth']
// #swagger.description = 'Endpoint to log out the current user.'

// Logout endpoint
app.get('/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        /* #swagger.responses[500] = {
        description: 'Error logging out.'
        } */
        return res.status(500).send(err);
      }
      /* #swagger.responses[302] = {
      description: 'Redirect to the landing page.'
      } */
      res.redirect('/'); // Redirect to landing page
    });
  });
  

}