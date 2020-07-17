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
    let content = `<body style="position: relative;width: 100%;height: 100vh;color: #32444e;background-color: #32444e; overflow: hidden">
<header style="text-align: center;width: inherit;height: auto;background-color: #e8ecef;">

    <div id="landingContainer"
         style="display: grid;width: inherit;grid-template-columns: 1fr 3fr 1fr;vertical-align: center;">
        <div id="intentionallyEmpty"></div>
        <div id="landingLogo" style="width: inherit;padding: 15px;">
            <img src="cid:fmLogo@twinbee.com" id="actualImage" alt="Freedom Makers Logo">
        </div>
    </div>
    <div id="pageTitle"
         style="width: inherit;height: auto;font-size: 1.5em;background-color: #32444e;color: white;text-align: center;padding: 6px;">
        <h2 style="color: #dbb459;">Welcome!</h2>
    </div>
</header>
<div id="landingMain" style="background-color: white;width: 100%;height: 35vh;text-align: center;padding-top: 250px; font-size: larger">
    <p>Your account is ready! <br>Sign in at our
        <a href='https://www.freedom-makers-hours.com'>Freedom Makers Portal</a> to get started!</p>
    <br><br>
</div>
<div id="footer" style="width: inherit;height: 100px;position: relative;left: 0;color: white;text-decoration: none;text-align: center;background-color: #32444e;padding-top: 5px;">
    This email was sent to notify you of your account's successful setup. No unsubscribe necessary.
    <div class="copyright">
        <h6>©2020 <img src="cid:twinbeeLogo@twinbee.com" id="twinbeeLogo" alt="TwinBee Logo"></h6>
    </div>
</div>
</body>
`
    console.log(`Sending an email to ${toEmail} with subject ${subject}`);
    transporter.sendMail({
        to: toEmail,
        subject: subject,
        html: content,
        attachments:
            [
                {
                    filename: 'TwinBee.png',
                    path: __dirname + '../public/img/TwinBee.png',
                    cid: 'twinbeeLogo@twinbee.com' //same cid value as in the html img src
                },
                {
                    filename: 'freedom-makers-logo.png',
                    path: __dirname +'../public/img/freedom-makers-logo.png',
                    cid: 'fmLogo@twinbee.com' //same cid value as in the html img src
                }
            ]
    }, (error) => {
        if (error) {
            console.log(error);
            exports.notifyAdmin(error)
            exports.notifyAdmin(error.toString())
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
    }).catch(err => {
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