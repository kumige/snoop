const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const answerSchema = new Schema({
    QuestionID: { type: mongoose.Types.ObjectId, ref: "Question" },
    Text: String,
    Image: String,
    Giphy: String,
    DateTime: {
      type: {
        date: String,
        time: String,
      },
    },
  });

module.exports = mongoose.model('Answer', answerSchema);
