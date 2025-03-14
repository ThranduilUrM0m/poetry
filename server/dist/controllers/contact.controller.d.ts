interface ContactFormData {
    email: string;
    phone: string;
    firstname: string;
    lastname: string;
    message: string;
}
export declare class ContactController {
    sendContactEmail(data: ContactFormData): Promise<{
        message: string;
    }>;
}
export {};
