require("dotenv").config();
const express = require("express");
const mongodb = require("mongodb");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bcrypt = require("bcrypt");
const cryptoRandomString = require("crypto-random-string");
const jwt = require('jsonwebtoken');

const hashHelper = require("./helpers/hashing");
const registered = require("./middleware/registeredUser");

const mongoClient = mongodb.MongoClient;
const objectID = mongodb.ObjectID;
const app = express();
const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017";
const dbName = process.env.DB_NAME;
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());

app.post("/register", [registered], async (req, res) => {
    try {
        if (req.body.password.length < 8) {
            res.status(200).json({
                status: "failed",
                message: "Password should be 8 characters long."
            });
        } else if (req.body.password != req.body.confirm_password) {
            res.status(200).json({
                status: "failed",
                message: "Password and Confirm Password should be same."
            });
        } else {
            // Pa$$w0rd!
            let clientInfo = await mongoClient.connect(dbUrl);
            let db = clientInfo.db(dbName);
            req.body.password = await hashHelper.generateHash(req.body.password);
            req.body.isActivated = false;
            delete req.body.confirm_password;
            await db.collection("users").insertOne(req.body);
            res.status(200).json({
                status: "success",
                message: "Account created. Please check your email for the link to activate your account."
            });
            clientInfo.close();
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            error
        });
    }
});

app.post("/login", async (req, res) => {

})


app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});