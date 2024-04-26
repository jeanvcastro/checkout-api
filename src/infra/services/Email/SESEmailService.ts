import { EmailService, type EmailMessage } from "@/core/services/EmailService";
import type TemplateService from "@/core/services/TemplateService";
import { SES, type SendEmailCommandInput } from "@aws-sdk/client-ses";

export default class SESEmailService extends EmailService {
  private readonly transporter: SES;

  constructor(protected readonly templateService: TemplateService) {
    super(templateService);
    this.transporter = new SES({
      apiVersion: "2010-12-01",
      region: process.env.AWS_SES_REGION ?? "us-east-2",
      credentials: {
        accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY ?? "",
      },
    });
  }

  async sendMail(message: EmailMessage, template: string, data: Record<string, any> = {}): Promise<void> {
    const sendEmailCommandInput = this.getSendEmailCommandInput(message, template, data);
    await this.transporter.sendEmail(sendEmailCommandInput);
  }

  private getSendEmailCommandInput(
    message: EmailMessage,
    template: string,
    data: Record<string, any> = {},
  ): SendEmailCommandInput {
    const senderName = process.env.APP_NAME;
    const domain = process.env.APP_URL ? new URL(process.env.APP_URL).hostname : "localhost";
    const senderAddress = `noreply@${domain}`;
    const source = `${senderName} <${senderAddress}>`;

    const body = this.templateService.render(template, data);

    const sendEmailCommandInput: SendEmailCommandInput = {
      Destination: {
        ToAddresses: [message.to.email],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: body,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: message.subject,
        },
      },
      Source: source,
      ReplyToAddresses: [senderAddress],
    };

    return sendEmailCommandInput;
  }
}
