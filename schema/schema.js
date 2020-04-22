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

const answer = require("../models/answer");
const profileInfo = require("../models/profileInfo");
const question = require("../models/question");
const user = require("../models/user");


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
            console.log(profileInfo.findOne());
          return profileInfo.find({_id: {$in: parent.ProfileInfo}});
        },
      },
      UserType: { type: GraphQLInt },
      LastLogin: { type: GraphQLString },
    }),
  });

const RootQuery = new GraphQLObjectType({
  name: "RootQuery",
  fields: {
    //user, questions etc...
    users: {
      type: new GraphQLList(userType),
      description: "Get all users.",
      resolve: async (parent, args, { req, res }) => {
        try {
          //console.log(user.find())
          return user.find();
        } catch (err) {
          throw new Error(err);
        }
      },
    },
    profileinfo: {
      type: new GraphQLList(profileInfoType),
      description: "Get profile info.",
      resolve: async (parent, args, { req, res }) => {
        try {
          //console.log(user.find())
          return profileInfo.find();
        } catch (err) {
          throw new Error(err);
        }
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
  }),
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
