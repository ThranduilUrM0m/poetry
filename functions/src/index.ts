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
  conf: { distDir: 'next-build' },
});
const handle = app.getRequestHandler();

export const nextSSR = functions.https.onRequest((req, res) => {
  return app.prepare().then(() => handle(req, res));
});
