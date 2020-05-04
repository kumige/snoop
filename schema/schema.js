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

const authController = require("../controllers/authController");

const bcrypt = require("bcrypt");
const saltRound = 12;

//const authController = require('../controllers/authController');
const validations = require("../utils/validations");
const date = require("../utils/date");
const fileHelper = require("../utils/savefile");
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
    Favourites: { type: new GraphQLList(GraphQLID) },
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
    Favourites: { type: new GraphQLList(GraphQLID) },
    Following: { type: new GraphQLList(GraphQLID) },
    Followers: { type: new GraphQLList(GraphQLID) },
    AnsweredQuestionCount: { type: GraphQLInt },
  }),
});

const questionType = new GraphQLObjectType({
  name: "question",
  fields: () => ({
    id: { type: GraphQLID },
    Sender: {
      type: userType,
      resolve(parent, args) {
        return user.findById(parent.Sender);
      },
    },
    Receiver: {
      type: userType,
      resolve(parent, args) {
        return user.findById(parent.Receiver);
      },
    },
    Text: { type: GraphQLString },
    Favourites: { type: new GraphQLList(GraphQLID) },
    DateTime: { type: dateTimeType },
    //Answer: { type: answerType },
    Answer: {
      type: answerType,
      resolve(parent, args) {
        return answer.findById(parent.Answer);
      },
    },
  }),
});

const answerType = new GraphQLObjectType({
  name: "answer",
  fields: () => ({
    id: { type: GraphQLID },
    Question: {
      type: questionType,
      resolve(parent, args) {
        return question.findById(parent.Question);
      },
    },
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

    userById: {
      type: userType,
      description: "get user by id",
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return user.findById(args.id);
      },
    },

    userByUsername: {
      type: userType,
      description: "get user by username",
      args: { username: { type: GraphQLString } },
      resolve(parent, args) {
        return user.findOne({ Username: args.username });
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
      resolve: async (parent, args) => {
        const questions = await question
          .find()
          .skip(args.start)
          .limit(args.limit)
          .populate("Sender")
          .populate("Receiver")
          .populate("Answer")
          .exec();

        return questions;
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

    questionsForUser: {
      type: new GraphQLList(questionType),
      description: "Get unanswered questions of a user",
      args: {
        id: { type: GraphQLID },
      },
      resolve: async (parent, args) => {
        const allQs = await question.find({ Receiver: args.id });
        const qsNoAnswers = [];

        allQs.forEach((q) => {
          if (q.Answer == undefined) {
            qsNoAnswers.push(q);
          }
        });

        return qsNoAnswers;
      },
    },

    qWithA: {
      type: new GraphQLList(answerType),
      description: "Get questions with an answer.",
      args: {
        limit: { type: GraphQLInt, defaultValue: 10 },
        start: { type: GraphQLInt, defaultValue: 0 },
      },
      resolve: async (parent, args) => {
        const questions = await answer
          .find()
          .skip(args.start)
          .limit(args.limit);

        return questions;
      },
    },

    qWithAOfUser: {
      type: new GraphQLList(questionType),
      description: "Get questions with an answer.",
      args: {
        limit: { type: GraphQLInt, defaultValue: 10 },
        start: { type: GraphQLInt, defaultValue: 0 },
        UserID: { type: GraphQLID },
      },
      resolve: async (parent, args) => {
        const questions = await question
          .find({ Receiver: args.UserID })
          .skip(args.start)
          .limit(args.limit);

        let qList = [];

        questions.forEach((singleQ) => {
          if (singleQ.Answer != undefined) {
            qList.push(singleQ);
          }
        });

        return qList;
      },
    },

    searchUser: {
      type: new GraphQLList(userType),
      description: "add profile info",
      args: {
        searchTerm: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        try {
          const searchResults = [];

          if (args.searchTerm != "" && typeof args.searchTerm === "string") {
            const results = await user.find({
              Username: { $regex: `${args.searchTerm}`, $options: "i" },
              //Displayname: { $regex: `${args.searchTerm}`, $options: "i" },
            });
            searchResults.push(results);
          }

          return searchResults[0];
        } catch (e) {
          throw new Error(e.message);
        }
      },
    },

    following: {
      type: new GraphQLList(userType),
      description: "Get list of users someone is following.",
      args: {
        id: { type: GraphQLID },
      },
      resolve: async (parent, args) => {
        // Get profile info where the following data is located
        const userProfile = await profileInfo.findOne({ UserID: args.id });

        // Create a list of users from the user IDs
        const followingList = Promise.all(
          userProfile.Following.map(async (userID) => {
            return await user.findById(userID);
          })
        );

        return followingList.then((data) => {
          return data;
        });
      },
    },

    followers: {
      type: new GraphQLList(userType),
      description: "Get list of users who follow someone.",
      args: {
        id: { type: GraphQLID },
      },
      resolve: async (parent, args) => {
        // Get profile info where the following data is located
        const userProfile = await profileInfo.findOne({ UserID: args.id });

        // Create a list of users from the user IDs
        const followerList = Promise.all(
          userProfile.Followers.map(async (userID) => {
            return await user.findById(userID);
          })
        );

        return followerList.then((data) => {
          return data;
        });
      },
    },

    favouriteAnswers: {
      type: new GraphQLList(questionType),
      description: "Get a list of a users favourited answers",
      args: {
        id: { type: GraphQLID },
      },
      resolve: async (parent, args) => {
        // Get profile info where the favourites is located
        const userProfile = await profileInfo.findOne({ UserID: args.id });

        // Create a list of questions from the question IDs
        const favouriteArray = Promise.all(
          userProfile.Favourites.map(async (qID) => {
            return await question.findById(qID);
          })
        );

        return favouriteArray.then((data) => {
          return data;
        });
      },
    },

    usersWhoFavourited: {
      type: new GraphQLList(userType),
      description: "Get a list of users who favourited an answer",
      args: {
        QuestionID: { type: GraphQLID },
      },
      resolve: async (parent, args) => {
        // Get question where the users are located
        const _question = await question.findOne({ _id: args.QuestionID });

        // Create a list of users from the user IDs
        const userArray = Promise.all(
          _question.Favourites.map(async (userID) => {
            return await user.findById(userID);
          })
        );

        return userArray.then((data) => {
          return data;
        });
      },
    },

    login: {
      type: userType,
      description: "Login with username and password to receive token.",
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args, { req, res }) => {
        console.log("arks", args);
        req.body = args; // inject args to reqest body for passport
        try {
          const authResponse = await authController.login(req, res);
          console.log("ar", authResponse);
          return {
            id: authResponse.user._id,
            ...authResponse.user,
            token: authResponse.token,
          };
        } catch (err) {
          throw new Error(err);
        }
      },
    },

    userCheck: {
      type: userType,
      description: "Gets current user, authentication required",
      resolve: async (parent, args, { req, res }) => {
        try {
          const authResult = await authController.checkAuth(req, res);
          authResult.token = null;
          return authResult;
        } catch (e) {
          throw new Error(e);
        }
      },
    },

    usernameCheck: {
      type: userType,
      description: "Gets user by its username and returns only username",
      args: {
        Username: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        try {
          const temp = await user.findOne({ Username: args.Username });
          // Setting every other variable for null for security purposes
          temp.Displayname = null;
          temp.Email = null;
          temp.Password = null;
          temp.UserType = null;
          temp.ProfileInfo = null;
          temp._id = null;
          temp.__v = null;
          return temp;
        } catch (e) {
          throw new Error(e.message);
        }
      },
    },

    displaynameCheck: {
      type: userType,
      description:
        "Gets user by its display name and returns only display name",
      args: {
        Displayname: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        try {
          const temp = await user.findOne({ Displayname: args.Displayname });
          // Setting every other variable for null for security purposes
          temp.Username = null;
          temp.Email = null;
          temp.Password = null;
          temp.UserType = null;
          temp.ProfileInfo = null;
          temp._id = null;
          temp.__v = null;
          console.log(temp);
          return temp;
        } catch (e) {
          throw new Error(e.message);
        }
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
        Receiver: { type: new GraphQLNonNull(GraphQLString) },
        Text: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args, { req, res }) => {
        try {
          const authResponse = await authController.checkAuth(req, res);
          const sender = await user.findOne({
            Username: authResponse.Username,
          });

          const newQuestion = new question({
            Sender: sender._id,
            Receiver: args.Receiver,
            Text: args.Text,
            Favourites: [],
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
      resolve: async (parent, args, { req, res }) => {
        try {
          const authResponse = await authController.checkAuth(req, res);

          // Check if question belongs to the logged in user
          const questions = await question.find({ Receiver: authResponse._id });
          const p = new Promise((resolve, reject) => {
            questions.forEach((singleQ) => {
              if (singleQ._id.toString() == args.id.toString()) {
                resolve(singleQ);
              }
            });
          });

          return p.then(async (data) => {
            return await question.findByIdAndDelete(data._id);
          });
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
      resolve: async (parent, args, { req, res }) => {
        try {
          const authResponse = await authController.checkAuth(req, res);
          const loggedInUser = await user.findOne({
            Username: authResponse.Username,
          });

          const newAnswer = new answer({
            Question: args.QuestionID,
            Text: args.Text,
            DateTime: date.now(),
          });

          const relatedQuestion = await question.findById(newAnswer.Question);
          relatedQuestion.Answer = newAnswer._id;

          // Check if the logged in user was the same as the question receiver
          if (
            loggedInUser._id.toString() == relatedQuestion.Receiver.toString()
          ) {
            console.log("paska");

            if (args.Image != undefined) {
              const image = args.Image;
              newAnswer.Image = await fileHelper.saveImage(image);
            }

            relatedQuestion.save();
            const aToReturn = await newAnswer.save();

            // Update answered questions count
            let answerCount = 0;
            await question.find(
              {
                Receiver: relatedQuestion.Receiver,
              },
              (err, questions) => {
                questions.forEach((q) => {
                  if (q.Answer != undefined) {
                    answerCount += 1;
                  }
                });
              }
            );
            let nProfile = await profileInfo.find({
              UserID: relatedQuestion.Receiver,
            });
            nProfile[0].AnsweredQuestionCount = answerCount;
            nProfile[0].save();

            return aToReturn;
          } else return null;
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
      resolve: async (parent, args, { req, res }) => {
        try {
          const authResponse = await authController.checkAuth(req, res);
          const answerToDelete = await answer.findById(args.id);
          const questionToDelete = await question.findById(
            answerToDelete.Question
          );

          // Check if the answerer is the logged in user
          if (
            questionToDelete.Receiver.toString() == authResponse._id.toString()
          ) {
            // Delete related question
            const relatedQuestion = await question.findByIdAndDelete(
              answerToDelete.Question
            );

            const res = await answer.findByIdAndDelete(args.id);

            // Update answered questions count
            let answerCount = 0;
            await question.find(
              {
                Receiver: relatedQuestion.Receiver,
              },
              (err, questions) => {
                questions.forEach((q) => {
                  if (q.Answer != undefined) {
                    answerCount += 1;
                  }
                });
              }
            );
            let nProfile = await profileInfo.find({
              UserID: relatedQuestion.Receiver,
            });
            nProfile[0].AnsweredQuestionCount = answerCount;
            nProfile[0].save();

            // Delete image
            if (res.Image != null) {
              fileHelper.deleteFile(res.Image);
            }

            return res;
          } else return null;
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
      },
      resolve: async (parent, args) => {
        try {
          // Gives all the register inputs for a function to check if they are valid
          const valid = validations.registerValidation(
            args.Username,
            args.Displayname,
            args.Email,
            args.Password
          );

          // If all the user inputs are valid, registers new user
          // If all of the user inputs are not valid, throws an error saying what is wrong
          if (valid.valid) {
            const sameDisplaynameCheck = await user.findOne({
              Displayname: args.Displayname,
            });

            const sameUsernameCheck = await user.findOne({
              Username: args.Username,
            });

            // Checks if the username and display name have already been taken
            // If they are, returns error
            // If they are not, registers user
            if (sameUsernameCheck == null) {
              if (sameDisplaynameCheck == null) {
                console.log("Displayname not taken");

                const hashedPass = await bcrypt.hash(args.Password, saltRound);

                let newProfile = new profileInfo(args.ProfileInfo);
                newProfile.ProfilePicture = "default.png";

                const userWithHashAndProfile = {
                  ...args,
                  Password: hashedPass,
                  ProfileInfo: newProfile,
                  UserType: 0,
                };

                //console.log(userWithHashAndProfile.Password);
                const newUser = new user(userWithHashAndProfile);

                // Filling the profile info
                newProfile.UserID = newUser.id;
                newProfile.Bio = "";
                newProfile.AnsweredQuestionCount = 0;

                await newProfile.save();
                return await newUser.save();
              } else {
                console.log("Displayname taken");
                throw new Error("Displayname taken");
              }
            } else {
              console.log("Username taken");
              throw new Error("Username taken");
            }
          } else {
            console.log("Unsuccessfull register: " + valid.message);
            throw new Error(valid.message);
          }
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

    modifyProfilePic: {
      type: profileInfoType,
      description: "modify profile picture",
      args: {
        ProfilePicture: {
          description: "Image file.",
          type: uploadScalar,
        },
      },
      resolve: async (parent, args, { req, res }) => {
        try {
          const image = "";
          if (args.ProfilePicture != undefined) {
            image = await fileHelper.saveImage(ProfilePicture);
          }
          return await profileInfo.findOneAndUpdate(
            { UserID: authResult._id },
            { ProfilePicture: image },
            {
              new: true,
            }
          );
        } catch (e) {
          throw new Error(e.message);
        }
      },
    },

    modifyDisplayName: {
      type: userType,
      description: "modify display name",
      args: {
        Displayname: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args, { req, res }) => {
        try {
          const authResult = await authController.checkAuth(req, res);

          // Checks if the display name is valid
          const validDisplayName = validations.displayNameValidation(
            args.Displayname
          );

          if (validDisplayName.valid) {
            // Checks if the display name is taken
            const sameDisplaynameCheck = await user.findOne({
              Displayname: args.Displayname,
            });
            if (sameDisplaynameCheck == null) {
              console.log("Displayname not taken");
              return await user.findByIdAndUpdate(authResult._id, args, {
                new: true,
              });
            } else {
              console.log("Displayname taken");
              throw new Error("Displayname taken");
            }
          } else {
            console.log("Unsuccessfull register: " + validDisplayName.message);
            throw new Error(validDisplayName.message);
          }
        } catch (e) {
          throw new Error(e.message);
        }
      },
    },

    modifyPassword: {
      type: userType,
      description: "modify password",
      args: {
        Password: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args, { req, res }) => {
        try {
          const authResult = await authController.checkAuth(req, res);

          const validPassword = validations.passwordValidation(args.Password);

          // Checks if the password is valid
          // If valid, hashes it and changes users password
          // If invalid, returns error
          if (validPassword.valid) {
            const hashedPass = await bcrypt.hash(args.Password, saltRound);

            return await user.findByIdAndUpdate(
              authResult._id,
              { Password: hashedPass },
              {
                new: true,
              }
            );
          } else {
            console.log("Unsuccessfull register: " + validPassword.message);
            throw new Error(validPassword.message);
          }
        } catch (e) {
          throw new Error(e.message);
        }
      },
    },

    modifyBio: {
      type: profileInfoType,
      description: "modify bio",
      args: {
        Bio: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args, { req, res }) => {
        try {
          const authResult = await authController.checkAuth(req, res);

          const validBio = validations.bioValidation(args.Bio);

          if (validBio.valid) {
            return await profileInfo.findOneAndUpdate(
              { UserID: authResult._id },
              args,
              {
                new: true,
              }
            );
          } else {
            console.log("Unsuccessfull register: " + validBio.message);
            throw new Error(validBio.message);
          }
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
        //Following: { type: new GraphQLList(GraphQLID) },
        //Followers: { type: new GraphQLList(GraphQLID) },
        AnsweredQuestionCount: { type: GraphQLInt },
      },
      resolve: async (parent, args) => {
        try {
          const profile = new profileInfo({
            UserID: args.UserID,
            Bio: args.Bio,
            ProfilePicture: args.ProfilePicture,
            //Following: args.Following,
            //Followers: args.Followers,
            Following: [],
            Followers: [],
            Favourites: [],
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
      resolve: async (parent, args, { req, res }) => {
        try {
          await authController.checkAuth(req, res);
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

    followUser: {
      type: profileInfoType,
      description: "follow a user",
      args: {
        UserID: { type: new GraphQLNonNull(GraphQLID) },
        UserToFollow: { type: new GraphQLNonNull(GraphQLID) },
      },
      //TODO: add user check, maybe with token?
      resolve: async (parent, args) => {
        try {
          let modifiedProfile = await profileInfo.findOne(
            { UserID: args.UserID },
            async (error, profile) => {
              // Check if UserToFollow is already in Following list
              const isInArray = profile.Following.some((userId) => {
                return userId.equals(args.UserToFollow);
              });

              // If not in Following, push new ID to Following
              if (!isInArray) {
                // Save user id to following list
                await profileInfo.findOneAndUpdate(
                  { UserID: args.UserID },
                  { $push: { Following: args.UserToFollow } },
                  { new: true }
                );

                // Save user id to followers list of the respective user
                await profileInfo.findOneAndUpdate(
                  { UserID: args.UserToFollow },
                  { $push: { Followers: args.UserID } },
                  { new: true }
                );
              }
            }
          );
          return await modifiedProfile;
        } catch (e) {
          throw new Error(e.message);
        }
      },
    },

    unfollowUser: {
      type: profileInfoType,
      description: "unfollow a user",
      args: {
        UserID: { type: new GraphQLNonNull(GraphQLID) },
        UserToUnfollow: { type: new GraphQLNonNull(GraphQLID) },
      },
      //TODO: add user check, maybe with token?
      resolve: async (parent, args) => {
        try {
          // Remove user id from followers list of the respective user
          await profileInfo.findOneAndUpdate(
            { UserID: args.UserToUnfollow },
            { $pull: { Followers: args.UserID } },
            { new: true }
          );

          // Remove user id from following list
          return await profileInfo.findOneAndUpdate(
            { UserID: args.UserID },
            { $pull: { Following: args.UserToUnfollow } },
            { new: true }
          );
        } catch (e) {
          throw new Error(e.message);
        }
      },
    },

    addFavourite: {
      type: questionType,
      description: "Favourite an answer",
      args: {
        UserID: { type: new GraphQLNonNull(GraphQLID) }, // TODO: CHANGE THIS TO GET USERID FROM TOKEN?
        QuestionID: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args) => {
        try {
          let _question = await question.findOne(
            { _id: args.QuestionID },
            async (error, q) => {
              console.log(q);
              // Check if user has already favourited the answer
              const isInFavourites = q.Favourites.some((userID) => {
                return userID.equals(args.UserID);
              });

              if (!isInFavourites) {
                // Save question id to the users favourites list
                await profileInfo.findOneAndUpdate(
                  { UserID: args.UserID },
                  { $push: { Favourites: args.QuestionID } },
                  { new: true }
                );

                // Save user id to favourites list of the respective question
                await question.findOneAndUpdate(
                  { _id: args.QuestionID },
                  { $push: { Favourites: args.UserID } },
                  { new: true }
                );
              }
            }
          );

          return _question;
        } catch (e) {
          throw new Error(e.message);
        }
      },
    },

    removeFavourite: {
      type: questionType,
      description: "Remove favourite from an answer",
      args: {
        UserID: { type: new GraphQLNonNull(GraphQLID) }, // TODO: CHANGE THIS TO GET USERID FROM PASSPORT-LOCAL
        QuestionID: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args) => {
        try {
          // Remove question from the favourites of the user
          await profileInfo.findOneAndUpdate(
            { UserID: args.UserID },
            { $pull: { Favourites: args.QuestionID } },
            { new: true }
          );

          // Remove user from question favourites
          return await question.findOneAndUpdate(
            { _id: args.QuestionID },
            { $pull: { Favourites: args.UserID } },
            { new: true }
          );
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
