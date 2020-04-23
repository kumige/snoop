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

const answerType = new GraphQLObjectType({
  name: "answer",
  fields: () => ({
    id: { type: GraphQLID },
    QuestionID: { type: GraphQLID },
    Text: { type: GraphQLString },
    Image: { type: GraphQLString },
    Giphy: { type: GraphQLString },
    DateTime: { type: dateTimeType },
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

    questions: {
      type: new GraphQLList(questionType),
      description: "Get all questions.",
      args: {
        limit: { type: GraphQLInt, defaultValue: 10 },
        start: { type: GraphQLInt, defaultValue: 0 },
      },
      resolve: (parent, args) => {
        return question.find();
      },
    },

    question: {
      type: questionType,
      description: "Get question by id.",
      args: {
        id: { type: GraphQLID },
      },
      resolve: (parent, args) => {
        return question.findById(args.id);
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: "MutationType",
  fields: () => ({
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
          const newQuestion = new question({
            Sender: args.Sender,
            Receiver: args.Receiver,
            Text: args.Text,
            DateTime: date.now(),
          });
          return await newQuestion.save();
        } catch (error) {
          console.log(error.message);
        }
      },
    },

    deleteQuestion: {
      type: questionType,
      description: "delete question",
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args) => {
        try {
          return await question.findByIdAndDelete(args.id);
        } catch (e) {
          throw new Error(e.message);
        }
      },
    },

    addAnswer: {
      type: answerType,
      description: "add an answer",
      args: {
        QuestionID: { type: new GraphQLNonNull(GraphQLID) },
        Text: { type: new GraphQLNonNull(GraphQLString) },
        Image: { type: GraphQLString },
        Giphy: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        try {
          const newAnswer = new answer({
            QuestionID: args.QuestionID,
            Sender: args.Sender,
            Receiver: args.Receiver,
            Text: args.Text,
            DateTime: date.now(),
          });

          const relatedQuestion = await question.findById(newAnswer.QuestionID);
          relatedQuestion.Answer = newAnswer._id;

          relatedQuestion.save();
          return await newAnswer.save();
        } catch (error) {
          console.log(error.message);
        }
      },
    },

    deleteAnswer: {
      type: answerType,
      description: "delete answer",
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args) => {
        try {
          const answerToDelete = await answer.findById(args.id);
          await question.findByIdAndDelete(answerToDelete.QuestionID);
          return await answer.findByIdAndDelete(args.id);
        } catch (e) {
          throw new Error(e.message);
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

          //console.log(userWithHashAndProfile.Password);
          const newUser = new user(userWithHashAndProfile);

          // Filling the profile info
          newProfile.UserID = newUser.id;
          newProfile.Bio = "";
          newProfile.AnsweredQuestionCount = 0;

          await newProfile.save();
          return await newUser.save();
        } catch (e) {
          throw new Error(e.message);
        }
      },
    },

    modifyUser: {
      type: userType,
      description: "modify user",
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        //token: { type: new GraphQLNonNull(GraphQLString) },
        Password: { type: GraphQLString },
        Displayname: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        try {
          // Variable to store modified data
          let updatedUserInfo = {};

          // Updates password if not null
          if (args.Password != null) {
            const hashedPass = await bcrypt.hash(args.Password, saltRound);
            updatedUserInfo.Password = hashedPass;
          }

          // Updates displayname if not null
          if (args.Displayname != null) {
            updatedUserInfo.Displayname = args.Displayname;
          }

          console.log(updatedUserInfo);
          return await user.findByIdAndUpdate(args.id, updatedUserInfo, {
            new: true,
          });
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
          return await profile.save();
        } catch (e) {
          throw new Error(e.message);
        }
      },
    },

    modifyProfile: {
      type: profileInfoType,
      description: "modify profile info",
      args: {
        UserID: { type: new GraphQLNonNull(GraphQLID) },
        //token: { type: new GraphQLNonNull(GraphQLString) },
        Bio: { type: GraphQLString },
        ProfilePicture: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        try {
          // Variable to store modified data
          let updatedProfileInfo = {};

          // Updates bio if not null
          if (args.Bio != null) {
            console.log("Bio changed");
            updatedProfileInfo.Bio = args.Bio;
          }

          // Updates profile picture if not null
          if (args.ProfilePicture != null) {
            console.log("PFP changed");
            updatedProfileInfo.ProfilePicture = args.ProfilePicture;
          }

          return await profileInfo.findOneAndUpdate(
            { UserID: args.UserID },
            updatedProfileInfo,
            {
              new: true,
            }
          );
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
          /*const result = await user.findById(args.id);
          const result2 = await profileInfo.findOne({
            UserID: args.id,
          });*/
          //console.log("user profile deleted: " + result2);
          //console.log("user deleted: " + result);

          // Deletes user and it's profile
          await profileInfo.findOneAndDelete({ UserID: args.id });
          return await user.findByIdAndDelete(args.id);
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
