const mongoose = require('mongoose');


const kittySchema = new mongoose.Schema({
    name: String
  });


//export const Kitten = mongoose.model('Kitten', kittySchema);

module.exports = mongoose.model('Kitten', kittySchema);