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
    console.log(`Sending an email to ${options.to} with subject ${options.subject}`);
    transporter.sendMail({to: process.env.ADMIN_TWINBEE, subject: "TwinBee Alert!", html:content}, (error) => {
        if (error) {
            console.log(error);
            reject(error);
        }
        resolve();
    });
});

/**
 * Sends an email to the admins
 * @param content
 * @returns {Promise<>}
 */
exports.emailAdmin = content => new Promise((resolve, reject) => {
    if (!process.env.TWINBEE_LIVE) {
        console.log(`Emailing admin!`);
        transporter.sendMail({to: process.env.ADMIN_TWINBEE, subject: "TwinBee Alert!", html: content}, (error) => {
            if (error) {
                console.log(error);
                reject(error);
            }
            resolve();
        });
        transporter.sendMail({to: process.env.ADMIN_WINBEE}, (error) => {
            if (error) {
                console.log(error);
                reject(error);
            }
            resolve();
        });
    }
    else{
        console.log("An email would have been sent to admins about an error, but we aren't on the live site.");
    }
});