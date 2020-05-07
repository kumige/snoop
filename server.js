"use strict";

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const graphQlHttp = require("express-graphql");
const { graphqlUploadExpress } = require('graphql-upload')
const passport = require("./utils/passport");
const schema = require("./schema/schema");
const db = require("./db/db");
const server = express();

server.use(cors());
server.use(express.json()); 
server.use(express.urlencoded({ extended: true })); 

server.use(express.static("public"));
server.use('/uploads', express.static('uploads'))
server.use("/modules", express.static("node_modules"));

server.use((req, res, next) => {
  if (req.secure || process.env.NODE_ENV === "development") {
    next();
  } else if (process.env.NODE_ENV === "production") {
    server.enable("trust proxy");
    res.redirect("https://" + req.headers.host + req.url);
    return;
  }
});

server.use(
  "/graphql",
  graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }),
  (req, res) => {
    graphQlHttp({ schema, graphiql: true, context: { req, res } })(req, res);
  }
);

db.on("connected", () => {
  console.log("db connected");
});

server.listen(3000); //normal http traffic
