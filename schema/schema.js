"use strict";

const {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLSchema,
  GraphQLBoolean,
  GraphQLNonNull,
} = require("graphql");

const bcrypt = require("bcrypt");
const saltRound = 12;

//const authController = require('../controllers/authController');
const date = require("../utils/date");
const answer = require("../models/answer");
const profileInfo = require("../models/profileinfo");
const question = require("../models/question");
const user = require("../models/user");

const userType = new GraphQLObjectType({
  name: "user",
  fields: () => ({
    id: { type: GraphQLID },
    token: { type: GraphQLString },
    Email: { type: GraphQLString },
    Username: { type: GraphQLString },
    Displayname: { type: GraphQLString },
    ProfileInfo: {
      type: profileInfoType,
      resolve(parent, args) {
        return profileInfo.findById(parent.ProfileInfo);
      },
    },
    UserType: { type: GraphQLInt },
    LastLogin: { type: GraphQLString },
  }),
});

const profileInfoType = new GraphQLObjectType({
  name: "profileinfo",
  fields: () => ({
    id: { type: GraphQLID },
    UserID: { type: GraphQLID },
    Bio: { type: GraphQLString },
    ProfilePicture: { type: GraphQLString },
    Following: { type: new GraphQLList(GraphQLID) },
    Followers: { type: new GraphQLList(GraphQLID) },
    AnsweredQuestionCount: { type: GraphQLInt },
  }),
});

const profileInfoInput = new GraphQLInputObjectType({
  name: "profileInputInfo",
  fields: () => ({
    id: { type: GraphQLID },
    UserID: { type: GraphQLID },
    Bio: { type: GraphQLString },
    ProfilePicture: { type: GraphQLString },
    Following: { type: new GraphQLList(GraphQLID) },
    Followers: { type: new GraphQLList(GraphQLID) },
    AnsweredQuestionCount: { type: GraphQLInt },
  }),
});

const questionType = new GraphQLObjectType({
  name: "question",
  fields: () => ({
    id: { type: GraphQLID },
    Sender: { type: GraphQLID },
    Receiver: { type: GraphQLID },
    Text: { type: GraphQLString },
    DateTime: { type: dateTimeType },
    Answer: { type: GraphQLID },
  }),
});

const dateTimeType = new GraphQLObjectType({
  name: "datetime",
  fields: () => ({
    date: { type: GraphQLString },
    time: { type: GraphQLString },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQuery",
  fields: {
    users: {
      type: new GraphQLList(userType),
      description: "Get all users.",
      resolve: (parent, args) => {
        //console.log(user.find())
        return user.find();
      },
    },
    user: {
      type: userType,
      description: "get user by id",
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return user.findById(args.id);
      },
    },
    profileinfo: {
      type: profileInfoType,
      description: "Get profile info.",
      args: { id: { type: GraphQLID } },
      resolve: (parent, args) => {
        //console.log(profileInfo.find());
        return profileInfo.findById(args.id);
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: "MutationType",
  fields: () => ({
    //addUser, addQuestion etc...
    addStation: {
      type: userType,
      description: "dummy mutation",

      resolve: async (parent, args, { req, res }) => {
        return true;
      },
    },

    addQuestion: {
      type: questionType,
      description: "add a question",
      args: {
        Sender: { type: new GraphQLNonNull(GraphQLString) },
        Receiver: { type: new GraphQLNonNull(GraphQLString) },
        Text: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        try {
          const dateTime = date.now();
          console.log('datetime: ' + dateTime);

          let newQuestion = new question({
            Sender: args.Sender,
            Receiver: args.Receiver,
            Text: args.Text,
            DateTime: dateTime,
          });
          return newQuestion.save();
        } catch (error) {
          console.log(error.message);
        }
      },
    },

    registerUser: {
      type: userType,
      description: "register user",
      args: {
        Username: { type: new GraphQLNonNull(GraphQLString) },
        Displayname: { type: new GraphQLNonNull(GraphQLString) },
        Email: { type: new GraphQLNonNull(GraphQLString) },
        Password: { type: new GraphQLNonNull(GraphQLString) },
        ProfileInfo: {
          type: new GraphQLNonNull(profileInfoInput),
        },
      },
      resolve: async (parent, args) => {
        try {
          const hashedPass = await bcrypt.hash(args.Password, saltRound);

          let newProfile = new profileInfo(args.ProfileInfo);

          const userWithHashAndProfile = {
            ...args,
            Password: hashedPass,
            ProfileInfo: newProfile,
          };

          //console.log(userWithHashAndProfile.ProfileInfo);
          const newUser = new user(userWithHashAndProfile);

          // Filling the profile info
          newProfile.UserID = newUser.id;
          newProfile.Bio = "";
          newProfile.AnsweredQuestionCount = 0;

          await newProfile.save();
          return newUser.save();
        } catch (e) {
          throw new Error(e.message);
        }
      },
    },

    addProfileInfo: {
      type: profileInfoType,
      description: "add profile info",
      args: {
        UserID: { type: GraphQLID },
        Bio: { type: GraphQLString },
        ProfilePicture: { type: GraphQLString },
        Following: { type: new GraphQLList(GraphQLID) },
        Followers: { type: new GraphQLList(GraphQLID) },
        AnsweredQuestionCount: { type: GraphQLInt },
      },
      resolve: async (parent, args) => {
        try {
          const profile = new profileInfo({
            UserID: args.UserID,
            Bio: args.Bio,
            ProfilePicture: args.ProfilePicture,
            Following: args.Following,
            Followers: args.Followers,
            AnsweredQuestionCount: args.AnsweredQuestionCount,
          });
          console.log(profile);
          return profile.save();
        } catch (e) {
          throw new Error(e.message);
        }
      },
    },

    deleteUser: {
      type: userType,
      description: "delete user",
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args) => {
        try {
          const result = await user.findById(args.id);
          console.log("user deleted: " + result);
          return user.findByIdAndDelete(args.id);
        } catch (e) {
          throw new Error(e.message);
        }
      },
    },
  }),
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
