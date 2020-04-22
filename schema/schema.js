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
        //console.log(profileInfo.find({_id: {$in: parent.ProfileInfo}}));
        console.log(parent.ProfileInfo);
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
      resolve(parent, args) {
        const profile = new profileInfo({
          UserID: args.UserID,
          Bio: args.Bio,
          ProfilePicture: args.ProfilePicture,
          Following: args.Following,
          Followers: args.Followers,
          AnsweredQuestionCount: args.AnsweredQuestionCount
        })
        console.log(profile)
        return profile.save()
      }
    },
  }),
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
