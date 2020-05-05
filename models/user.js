const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  Email: String,
  Username: String,
  Displayname: String,
  Password: String,
  ProfileInfo: { type: mongoose.Types.ObjectId, ref: "ProfileInfo" },
  BlockedUsers: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  UserType: Number,
  LastLogin: String,
});

module.exports = mongoose.model("User", userSchema);
