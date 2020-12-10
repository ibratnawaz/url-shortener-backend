async function passwordCheck(req, res, next) {
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
        next();
    }
}

module.exports = passwordCheck;