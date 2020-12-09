const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;

const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017";
const dbName = process.env.DB_NAME;

async function userRegistered(req, res, next) {
    let clientInfo = await mongoClient.connect(dbUrl);
    let db = clientInfo.db(dbName);
    let data = await db.collection("users").findOne({
        email: req.body.email
    });
    if (data) {
        res.status(200).json({
            status: "rejected",
            message: "Email already taken"
        });
    } else {
        next();
    }
}

module.exports = userRegistered;