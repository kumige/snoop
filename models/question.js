const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const questionSchema = new Schema({
    Sender: {type: mongoose.Types.ObjectId, ref: 'User'},
    Receiver: {type: mongoose.Types.ObjectId, ref: 'User'},
    Text: String,
    DateTime: String,
    Answer: {type: mongoose.Types.ObjectId, ref: 'Answer'}
  });

module.exports = mongoose.model('Question', questionSchema);