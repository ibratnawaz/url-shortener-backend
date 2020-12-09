const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;

const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017";
const dbName = process.env.DB_NAME;

async function userActivated(req, res, next) {
    try {
        let clientInfo = await mongoClient.connect(dbUrl);
        let db = clientInfo.db(dbName);
        let data = await db.collection("users").findOne({
            $and: [{
                email: req.body.email
            }, {
                isActivated: true
            }]
        });
        if (data) {
            next();
        } else {
            res.status(200).json({
                status: "failed",
                message: "Please activate your account before login."
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error
        });
    }
}

module.exports = userActivated;