/*
lots of help from https://www.woolha.com/tutorials/node-js-send-email-using-gmail-with-nodemailer-oauth-2
as well as nodemailer and google api docs.
* */

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        type: 'OAuth2',
        user: process.env.NOTIFIER_EMAIL,
        clientId: process.env.TWINBEE_CLIENT_ID,
        clientSecret: process.env.TWINBEE_CLIENT_SECRET,
        refreshToken: process.env.TWINBEE_OAUTH_REFRESH_TOKEN,
        accessToken: process.env.TWINBEE_OAUTH_ACCESS_TOKEN,
        expires: Number.parseInt(process.env.TWINBEE_OAUTH_TOKEN_EXPIRE, 10),
    },
});

/**
 * Sends an email to the target email.
 *
 * @param options object in the form:{
 *     to: "email@tosend.to",
 *     subject: "Subject for email",
 *     html: Html body for email to be sent
 * }
 * @returns {Promise<>}
 */
exports.sendEmail = options => new Promise((resolve, reject) => {
    transporter.sendMail(options, (error) => {
        if (error) {
            console.log(error);
            reject(error);
        }
        resolve();
    });
});