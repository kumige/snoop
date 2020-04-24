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
  GraphQLScalarType,
} = require("graphql");
const GraphQLUpload = require("graphql-upload");
const uniqueSlug = require('unique-slug')
const fs = require("fs");
const uploadURI = "C:/Users/Mikko/Desktop/snoop/uploads/"

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

const uploadScalar = new GraphQLScalarType({
  name: "upload",
  Upload: { type: GraphQLUpload },
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

// Saves the image and returns the filename that will be saved to db
const saveImage = async (image) => {
  const fname = image.file.filename
  const path = `${ uploadURI }${ uniqueSlug() + '.jpg' }`;
  const stream = image.file.createReadStream();
  stream.pipe(fs.createWriteStream(path));

  return fname
}

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
          return newQuestion.save();
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
          return question.findByIdAndDelete(args.id);
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
        Image: {
          description: "Image file.",
          type: uploadScalar,
        },
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

          if (args.Image != undefined) {
            const image = args.Image
            newAnswer.Image = await saveImage(image)
          }

          const relatedQuestion = await question.findById(newAnswer.QuestionID);
          relatedQuestion.Answer = newAnswer._id;

          relatedQuestion.save();
          return newAnswer.save();
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
          return answer.findByIdAndDelete(args.id);
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

/* Add answer with file upload mutation
mutation($file: upload) {
  addAnswer(
    QuestionID: "5ea1506e78f10542809f20e1"
    Text: "img test"
    Image: $file
  ) {
    id
    QuestionID
    Text
    Image
    Giphy
    DateTime {
      date
      time
    }
  }
}
*/
