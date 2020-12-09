const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;

const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017";
const dbName = process.env.DB_NAME;

async function userPresent(req, res, next) {
    try {
        let clientInfo = await mongoClient.connect(dbUrl);
        let db = clientInfo.db(dbName);
        let data = await db.collection("users").findOne({
            email: req.body.email
        });
        if (data) {
            next();
        } else {
            res.status(200).json({
                status: "failed",
                message: "No user found with this email. Please register and re-try login."
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error
        });
    }
}

module.exports = userPresent;