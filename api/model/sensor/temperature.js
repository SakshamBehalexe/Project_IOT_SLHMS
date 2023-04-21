const mongoose = require('mongoose');

module.exports = mongoose.model('Temperature', new mongoose.Schema({
  id: String,
  name: String,
  location: String,
  temperature: Number
}, { collection : 'Temperature_1' }));
