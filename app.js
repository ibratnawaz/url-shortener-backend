require("dotenv").config();
const express = require("express");
const mongodb = require("mongodb");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bcrypt = require("bcrypt");
const cryptoRandomString = require("crypto-random-string");
const jwt = require('jsonwebtoken');

const hashHelper = require("./helpers/hashing");
const mailHelper = require("./helpers/mailer");
const registered = require("./middleware/registeredUser");
const activated = require("./middleware/activatedUser");
const checkUser = require("./middleware/checkUser");
const {
    async
} = require("crypto-random-string");

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
            let clientInfo = await mongoClient.connect(dbUrl);
            let db = clientInfo.db(dbName);
            req.body.password = await hashHelper.generateHash(req.body.password);
            req.body.isActivated = false;
            delete req.body.confirm_password;
            let message = 'Click the below link to activate your account.'
            let apiLink = 'http://localhost:3000/activate?activation_string'
            req.body.activationString = await mailHelper(message, req.body.email, apiLink);
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

app.post("/login", [checkUser, activated], async (req, res) => {
    try {
        let clientInfo = await mongoClient.connect(dbUrl);
        let db = clientInfo.db(dbName);
        let data = await db.collection('users').findOne({
            email: req.body.email
        });
        let passwordMatch = await hashHelper.compareHash(req.body.password, data.password);
        if (passwordMatch) {
            let token = jwt.sign({
                userId: data._id,
                iat: Date.now()
            }, process.env.JWT_KEY);
            res.json({
                status: "success",
                message: "Login successful",
                userId: data._id,
                token
            });
        } else {
            res.json({
                status: "failed",
                message: "Please check your password and try again."
            });
        }
        clientInfo.close();
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error
        });
    }
});

app.get("/verify/:id", async (req, res) => {
    try {
        let decodedData = jwt.verify(req.headers.authorization, process.env.JWT_KEY);
        if (decodedData.userId == req.params.id) {
            let clientInfo = await mongoClient.connect(dbUrl);
            let db = clientInfo.db(dbName);
            let data = await db.collection('users').findOne({
                _id: objectID(req.params.id)
            });
            if (data) {
                res.status(200).json({
                    status: "success",
                    is_loggedIn: true
                });
            } else {
                res.status(400).json({
                    status: "failed",
                    is_loggedIn: false
                });
            }
        } else {
            res.status(400).json({
                status: "failed",
                is_loggedIn: false
            });
        }
    } catch (error) {
        // console.log(error);
        res.status(400).json({
            status: "failed",
            error
        });
    }
});

app.get("/activate", async (req, res) => {
    try {
        let clientInfo = await mongoClient.connect(dbUrl);
        let db = clientInfo.db(dbName);
        let data = await db.collection('users').findOne({
            activationString: req.query.activation_string
        });
        if (data) {
            await db.collection('users').updateOne({
                _id: objectID(data._id)
            }, {
                $set: {
                    activationString: '',
                    isActivated: true
                }
            });
            res.send(`<p>Account activated. Click
                <a href="http://localhost:8000/login.html">here</a> to login.</p>`);
        } else {
            res.send('<p>link expired</p>')
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({
            error
        });
    }
});



app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});