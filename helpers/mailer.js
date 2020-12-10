const nodemailer = require("nodemailer");
const cryptoRandomString = require("crypto-random-string");


let generateMail = function (message, email, apiLink, uid = '') {
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
                length: 32,
                type: 'url-safe'
            });

            let finalStr;
            let subject;
            if (uid) {
                finalStr = `${str}_._${uid}`;
                subject = 'Reset password';
            } else {
                finalStr = str;
                subject = 'Activate account';
            }

            let info = await transporter.sendMail({
                from: `Short URL <${process.env.MAIL_USERNAME}>`, // sender address
                to: `${email}`, // list of receivers
                subject: `${subject}`, // Subject line
                html: `<b>${message}</b><br><p>${apiLink}=${finalStr}</p>`,
            });
            resolve(str);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = generateMail;