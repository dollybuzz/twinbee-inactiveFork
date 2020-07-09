/*
lots of help from https://www.woolha.com/tutorials/node-js-send-email-using-gmail-with-nodemailer-oauth-2
as well as nodemailer and google api docs.
* */

const nodemailer = require('nodemailer');
const {WebClient} = require('@slack/web-api');
const slackToken = process.env.SLACK_TOKEN;
const web = new WebClient(slackToken);

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
 * Sends an email to the designated email with designated subject
 * and html content
 *
 * @param toEmail   - email to send to
 * @param subject   - subject of email
 * @param content   - content
 * @returns {Promise<unknown>}
 */
exports.sendEmail = (toEmail, subject, content) => new Promise((resolve, reject) => {
    console.log(`Sending an email to ${toEmail} with subject ${subject}`);
    transporter.sendMail({to: toEmail, subject: subject, html: content}, (error) => {
        if (error) {
            console.log(error);
            reject(error);
        }
        resolve();
    });
});
/**
 * Sends a welcome email with a link to the live website to the designated
 * email address
 *
 * @param toEmail   - email to send to
 * @returns {Promise<unknown>}
 */
exports.sendWelcome = toEmail => new Promise((resolve, reject) => {
    let subject = "Welcome to Freedom Makers!";
    let content = "<h1>Welcome!</h1><br>" +
        "<p>Your account is ready! Sign in at our " +
        "<a href='https://www.freedom-makers-hours.com'>Freedom Makers Portal</a> to get started!</p>" +
        "<br><br>" +
        "This email was sent to notify you of your account's successful setup.  No unsubscribe necessary.";
    console.log(`Sending an email to ${toEmail} with subject ${subject}`);
    transporter.sendMail({to: toEmail, subject: subject, html: content}, (error) => {
        if (error) {
            console.log(error);
            reject(error);
        }
        resolve();
    });
});

/**
 *
 * @param content
 */
exports.notifyAdmin = content => {
    let tracer = new Error();

    let channel = process.env.TWINBEE_LIVE ? "C0163S58V0D" : "C015TU1QG0P";
        console.log(`Notifying admin!`);
        web.chat.postMessage({
            text: content,
            channel: channel,
        }).catch(err=>{
            console.log(err + `     Trace: ${JSON.stringify(tracer.stack)}`);
            exports.notifyAdmin(err.toString())
        });
};

/**
 * Sends an email to the Freedom Makers admins
 * @param subject - email subject
 * @param content - email content
 * @returns {Promise<>}
 */
exports.emailFMAdmin = (subject, content) => new Promise((resolve, reject) => {
    if (process.env.TWINBEE_LIVE) {
        console.log(`Emailing Freedom Makers!`);
        setTimeout(() => {
            transporter.sendMail({
                to: process.env.FREEDOM_MAKERS_ADMIN_EMAIL,
                subject: subject,
                html: content
            }, (error) => {
                if (error) {
                    console.log(error);
                    reject(error);
                }
                resolve();
            });
        }, 3000);
    } else {
        console.log("An email would have been sent to admins about an error, but we aren't on the live site.");
    }
});