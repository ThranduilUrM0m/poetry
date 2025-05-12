// src/controllers/contact.controller.ts

import { Controller, Post, Body, InternalServerErrorException, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { OAuth2Client } from 'google-auth-library';
import * as dotenv from 'dotenv';
import { NotificationService } from 'src/services/notification.service';
import { NotificationGateway } from 'src/gateways/notification.gateway';

dotenv.config();

/**
 * DTO for validating & typing incoming contact-form payload.
 */
export class ContactFormDto {
    email!: string;
    phone!: string;
    firstname!: string;
    lastname!: string;
    message!: string;
}

/**
 * Injectable helper service to encapsulate mail transport logic.
 * Keeps controller lean and testable.
 */
@Injectable()
export class MailService {
    private readonly oauth2Client: OAuth2Client;
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly redirectUri: string;
    private readonly refreshToken: string;
    private readonly gmailUser: string;

    constructor() {
        // Required environment variables
        this.clientId = process.env.GMAIL_CLIENT_ID ?? '';
        this.clientSecret = process.env.GMAIL_CLIENT_SECRET ?? '';
        this.redirectUri = process.env.GMAIL_REDIRECT_URI ?? '';
        this.refreshToken = process.env.GMAIL_REFRESH_TOKEN ?? '';
        this.gmailUser = process.env.GMAIL_USER ?? '';

        // Validate presence
        if (
            !this.clientId ||
            !this.clientSecret ||
            !this.redirectUri ||
            !this.refreshToken ||
            !this.gmailUser
        ) {
            throw new InternalServerErrorException(
                'Missing GMail OAuth2 configuration in environment'
            );
        }

        this.oauth2Client = new OAuth2Client(this.clientId, this.clientSecret, this.redirectUri);
        this.oauth2Client.setCredentials({ refresh_token: this.refreshToken });
    }

    /**
     * Creates a Nodemailer transporter configured for GMail OAuth2.
     */
    public async createTransporter(): Promise<
        nodemailer.Transporter<SMTPTransport.SentMessageInfo>
    > {
        // Fetch a fresh access token
        const accessTokenResponse = await this.oauth2Client.getAccessToken();
        const accessToken = accessTokenResponse.token;
        if (!accessToken) {
            throw new InternalServerErrorException('Unable to retrieve GMail access token');
        }

        const auth: SMTPTransport.Options['auth'] = {
            type: 'OAuth2',
            user: this.gmailUser,
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            refreshToken: this.refreshToken,
            accessToken,
        };

        return nodemailer.createTransport({
            service: 'gmail',
            auth,
        });
    }

    /**
     * Sends a contact-form email using the provided form data.
     */
    public async sendContactForm(form: ContactFormDto): Promise<void> {
        const transporter = await this.createTransporter();

        const mailOptions: nodemailer.SendMailOptions = {
            from: `"${form.firstname} ${form.lastname}" <${form.email}>`,
            to: this.gmailUser,
            subject: 'New Contact Form Submission',
            text: [
                `First Name: ${form.firstname}`,
                `Last Name:  ${form.lastname}`,
                `Email:      ${form.email}`,
                `Phone:      ${form.phone}`,
                '',
                'Message:',
                form.message,
            ].join('\n'),
        };

        await transporter.sendMail(mailOptions);
    }
}

@Controller('api/contact')
export class ContactController {
    constructor(
        private readonly mailService: MailService,
        private readonly notificationService: NotificationService,
        private readonly notificationGateway: NotificationGateway
    ) {}

    /**
     * POST /api/contact
     * Accepts a ContactFormDto and sends an email.
     */
    @Post()
    async sendContactEmail(@Body() data: ContactFormDto): Promise<{ message: string }> {
        try {
            // Save or process the contact message
            const result = await this.mailService.sendContactForm(data);

            // Send notification
            await this.notificationService.create({
                category: 'contact',
                action: 'sent',
                title: 'New Contact Message',
                message: `Contact message from "${data.firstname} ${data.lastname}" <${data.email}>`,
                metadata: {
                    email: data.email,
                    firstname: data.firstname,
                    lastname: data.lastname,
                    phone: data.phone,
                    message: data.message,
                },
            });

            // Emit websocket event
            this.notificationGateway.server.emit('contact:sent', {
                type: 'sent',
                contact: {
                    email: data.email,
                    firstname: data.firstname,
                    lastname: data.lastname,
                    phone: data.phone,
                    message: data.message,
                },
            });

            return { message: 'Email sent successfully' };
        } catch (err) {
            // Preserve original message if present
            const msg = err instanceof Error ? err.message : 'Unknown error sending email';
            throw new InternalServerErrorException(`Failed to send contact email: ${msg}`);
        }
    }
}
