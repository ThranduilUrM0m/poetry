"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactController = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
const google_auth_library_1 = require("google-auth-library");
const dotenv = require("dotenv");
dotenv.config();
const clientId = process.env.GMAIL_CLIENT_ID;
const clientSecret = process.env.GMAIL_CLIENT_SECRET;
const redirectUri = process.env.GMAIL_REDIRECT_URI;
const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
const gmailUser = process.env.GMAIL_USER;
const oauth2Client = new google_auth_library_1.OAuth2Client(clientId, clientSecret, redirectUri);
oauth2Client.setCredentials({ refresh_token: refreshToken });
async function createTransporter() {
    const accessTokenObj = await oauth2Client.getAccessToken();
    if (!accessTokenObj.token) {
        throw new common_1.InternalServerErrorException('Failed to retrieve access token');
    }
    const accessToken = accessTokenObj.token;
    const authOptions = {
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
let ContactController = class ContactController {
    async sendContactEmail(data) {
        try {
            const transporter = await createTransporter();
            const mailOptions = {
                from: data.email,
                to: gmailUser,
                subject: 'Contact Form Submission',
                text: `First Name: ${data.firstname}\nLast Name: ${data.lastname}\nPhone: ${data.phone}\nMessage: ${data.message}`,
            };
            await transporter.sendMail(mailOptions);
            return { message: 'Email sent successfully' };
        }
        catch (error) {
            if (error instanceof Error) {
                throw new common_1.InternalServerErrorException(`Error sending email: ${error.message}`);
            }
            else {
                throw new common_1.InternalServerErrorException('Unknown error occurred');
            }
        }
    }
};
exports.ContactController = ContactController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "sendContactEmail", null);
exports.ContactController = ContactController = __decorate([
    (0, common_1.Controller)('api/contact')
], ContactController);
//# sourceMappingURL=contact.controller.js.map