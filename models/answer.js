const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const answerSchema = new Schema({
    Text: String,
    Image: String,
    Giphy: String,
    DateTime: String,
  });

module.exports = mongoose.model('Answer', answerSchema);
