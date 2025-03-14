import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import { google } from "googleapis";
import * as dotenv from "dotenv";
import next from 'next';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
admin.initializeApp();

// OAuth2 setup
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
);

oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

async function createTransporter() {
    const accessToken = await oauth2Client.getAccessToken();

    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: process.env.GMAIL_USER, // Make sure to add this variable
            clientId: process.env.GMAIL_CLIENT_ID,
            clientSecret: process.env.GMAIL_CLIENT_SECRET,
            refreshToken: process.env.GMAIL_REFRESH_TOKEN,
            accessToken: accessToken.token || "",
        }
    });
}

// Firebase function to send emails
export const sendEmail = functions.https.onRequest(async (req, res) => {
    try {
        const transporter = await createTransporter();
        const mailOptions = {
            from: process.env.GMAIL_USER, // Use email from env
            to: req.body.to,
            subject: req.body.subject,
            text: req.body.text,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).send("Email sent successfully!");
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).send("Error sending email");
    }
});

// Next.js SSR function
const dev = process.env.NODE_ENV !== 'production';
const app = next({
  dev,
  conf: { distDir: '.next' },
});
const handle = app.getRequestHandler();

export const nextSSR = functions.https.onRequest((req, res) => {
  return app.prepare().then(() => handle(req, res));
});

// Configure the email transport using the default SMTP transport and a GMail account.
// For Gmail, enable these:
// 1. https://www.google.com/settings/security/lesssecureapps
// 2. https://accounts.google.com/DisplayUnlockCaptcha
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: functions.config().gmail.email,
        pass: functions.config().gmail.password,
    },
});

export const sendContactEmail = functions.https.onRequest((req, res) => {
    const { email, phone, firstname, lastname, message } = req.body;

    const mailOptions = {
        from: email,
        to: functions.config().gmail.email,
        subject: 'Contact Form Submission',
        text: `
            First Name: ${firstname}
            Last Name: ${lastname}
            Phone: ${phone}
            Message: ${message}
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send(error.toString());
        }
        return res.status(200).send('Email sent successfully');
    });
});
