import type TemplateService from "./TemplateService";

interface EmailAddress {
  email: string;
  name: string;
}

export interface EmailMessage {
  to: EmailAddress;
  from?: EmailAddress;
  subject: string;
}

export abstract class EmailService {
  constructor(protected readonly templateService: TemplateService) {}

  async sendMail(message: EmailMessage, template: string, data?: Record<string, any>) {
    throw new Error("Method not implemented.");
  }
}
