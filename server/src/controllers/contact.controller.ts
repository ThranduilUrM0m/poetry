/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Controller, Post, Body, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import * as dotenv from 'dotenv';

dotenv.config();

const clientId = process.env.GMAIL_CLIENT_ID as string;
const clientSecret = process.env.GMAIL_CLIENT_SECRET as string;
const redirectUri = process.env.GMAIL_REDIRECT_URI as string;
const refreshToken = process.env.GMAIL_REFRESH_TOKEN as string;
const gmailUser = process.env.GMAIL_USER as string;

const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
oauth2Client.setCredentials({ refresh_token: refreshToken });

async function createTransporter(): Promise<nodemailer.Transporter<SMTPTransport.SentMessageInfo>> {
    const accessTokenObj = await oauth2Client.getAccessToken();
    if (!accessTokenObj.token) {
        throw new InternalServerErrorException('Failed to retrieve access token');
    }
    const accessToken = accessTokenObj.token;

    const authOptions: SMTPTransport.Options['auth'] = {
        type: 'OAuth2',
        user: gmailUser,
        clientId,
        clientSecret,
        refreshToken,
        accessToken,
    };

    return nodemailer.createTransport({
        service: 'gmail',
        auth: authOptions,
    });
}

interface ContactFormData {
    email: string;
    phone: string;
    firstname: string;
    lastname: string;
    message: string;
}

@Controller('api/contact')
export class ContactController {
    @Post()
    async sendContactEmail(@Body() data: ContactFormData): Promise<{ message: string }> {
        try {
            const transporter = await createTransporter();
            const mailOptions: nodemailer.SendMailOptions = {
                from: data.email,
                to: gmailUser,
                subject: 'Contact Form',
                text: `First Name: ${data.firstname}\nLast Name: ${data.lastname}\nEmail: ${data.email}\nPhone: ${data.phone}\nMessage: ${data.message}`,
            };

            await transporter.sendMail(mailOptions);
            return { message: 'Email sent successfully' };
        } catch (error: unknown) {
            /* console.error('Error occurred:', error); */
            if (error instanceof Error) {
                throw new InternalServerErrorException(`Error sending email: ${error.message}`);
            } else {
                throw new InternalServerErrorException('Unknown error occurred');
            }
        }
    }
}
