require("dotenv").config();
const express = require("express");
const mongodb = require("mongodb");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bcrypt = require("bcrypt");
const cryptoRandomString = require("crypto-random-string");
const jwt = require('jsonwebtoken');

const hashHelper = require("./helpers/hashing");

const mongoClient = mongodb.MongoClient;
const objectID = mongodb.ObjectID;
const app = express();
const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017";
const dbName = process.env.DB_NAME;
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());

app.post("/register", async (req, res) => {
    try {
        let clientInfo = await mongoClient.connect(dbUrl);
        let db = clientInfo.db(dbName);
        let data = await db.collection("users").insertOne(req.body);
        res.status(200).json({
            status: "success",
            data
        })
        clientInfo.close();
    } catch (error) {
        console.log(error)
    }
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});