import { type Job } from "@/core/Job";
import configureDI from "@/shared/di";

interface SendNotificationJobData {
  email: string;
  name: string;
}

const SendNotificationJob: Job = {
  name: "SendNotificationJob",
  processor: async (data: SendNotificationJobData) => {
    const container = configureDI();
    const emailService = container.get("EmailService");

    const message = {
      to: {
        email: data.email,
        name: data.name,
      },
      subject: "Pedido confirmado com sucesso",
    };

    await emailService.sendMail(message, "SaleApproved", data);
  },
};

export default SendNotificationJob;
