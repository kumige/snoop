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
server.use(express.json()); // for parsing application/json
server.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

server.use(express.static("public"));
server.use("/modules", express.static("node_modules"));

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
