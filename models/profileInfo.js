const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const profileInfoSchema = new Schema({
    UserID: {type: mongoose.Types.ObjectId, ref: 'User'},
    Bio: String,
    ProfilePicture: String,
    Following: [{type: mongoose.Types.ObjectId, ref: 'User'}],
    Followers: [{type: mongoose.Types.ObjectId, ref: 'User'}],
    AnsweredQuestionCount: Number
  });

module.exports = mongoose.model('ProfileInfo', profileInfoSchema);