import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';

// Initialize Firebase Admin
admin.initializeApp();

// OAuth2 setup
const OAuth2 = google.auth.OAuth2;

// Email transporter setup
const createTransporter = async () => {
    const oauth2Client = new OAuth2(
        functions.config().gmail.client_id,
        functions.config().gmail.client_secret,
        functions.config().gmail.redirect_uri
    );

    oauth2Client.setCredentials({
        refresh_token: functions.config().gmail.refresh_token,
    });

    const accessToken = await oauth2Client.getAccessToken();

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: functions.config().gmail.user,
            clientId: functions.config().gmail.client_id,
            clientSecret: functions.config().gmail.client_secret,
            refreshToken: functions.config().gmail.refresh_token,
            accessToken: accessToken.token || '',
        },
    });
};

// Firebase function to send emails
export const sendEmail = functions.https.onRequest(async (req, res) => {
    try {
        const transporter = await createTransporter();
        const mailOptions = {
            from: functions.config().gmail.user,
            to: req.body.to,
            subject: req.body.subject,
            text: req.body.text,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).send('Email sent successfully!');
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Error sending email');
    }
});

// Contact form handler
export const contact = functions.https.onRequest(async (req, res) => {
    try {
        const { email, phone, firstname, lastname, message } = req.body;
        const transporter = await createTransporter();

        const mailOptions = {
            from: email,
            to: functions.config().gmail.user,
            subject: 'Contact Form Submission',
            text: `
        First Name: ${firstname}
        Last Name: ${lastname}
        Phone: ${phone}
        Message: ${message}
      `,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).send('Email sent successfully');
    } catch (error) {
        console.error('Error sending contact email:', error);
        res.status(500).send(error.toString());
    }
});
