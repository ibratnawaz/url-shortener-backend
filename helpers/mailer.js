const nodemailer = require("nodemailer");
const cryptoRandomString = require("crypto-random-string");


let generateMail = function (message, email, apiLink) {
    return new Promise(async function (resolve, reject) {
        try {
            let transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.MAIL_USERNAME,
                    pass: process.env.MAIL_PASSWORD,
                },
            });

            let str = cryptoRandomString({
                length: 20,
                type: 'url-safe'
            });
            // Click the below link to reset your password. It is one-time link, once you 
            // changed your password using the link, it will be expired.
            // http://localhost:3000/register?reset_string
            let info = await transporter.sendMail({
                from: `Mini-URL <${process.env.MAIL_USERNAME}>`, // sender address
                to: `${email}`, // list of receivers
                subject: `Reset password`, // Subject line
                html: `<b>${message}</b><br><p>${apiLink}=${str}</p>`,
            });
            resolve(str);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = generateMail;