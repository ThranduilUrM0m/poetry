import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { NotificationService } from 'src/services/notification.service';
import { NotificationGateway } from 'src/gateways/notification.gateway';
export declare class ContactFormDto {
    email: string;
    phone: string;
    firstname: string;
    lastname: string;
    message: string;
}
export declare class MailService {
    private readonly oauth2Client;
    private readonly clientId;
    private readonly clientSecret;
    private readonly redirectUri;
    private readonly refreshToken;
    private readonly gmailUser;
    constructor();
    createTransporter(): Promise<nodemailer.Transporter<SMTPTransport.SentMessageInfo>>;
    sendContactForm(form: ContactFormDto): Promise<void>;
}
export declare class ContactController {
    private readonly mailService;
    private readonly notificationService;
    private readonly notificationGateway;
    constructor(mailService: MailService, notificationService: NotificationService, notificationGateway: NotificationGateway);
    sendContactEmail(data: ContactFormDto): Promise<{
        message: string;
    }>;
}
