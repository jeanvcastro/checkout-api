import {
  type PaymentRequest,
  type PaymentResponse,
  type PaymentStrategy,
} from "@/core/services/Payment/PaymentStrategy";
import axios from "axios";
import { PagarmeGateway } from "../Gateway/PagarmeGateway";

export class CreditCardStrategy implements PaymentStrategy {
  async processPayment(data: PaymentRequest): Promise<PaymentResponse> {
    const pagarmeGateway = new PagarmeGateway(process.env.PAGARME_API_KEY ?? "", axios);
    return await pagarmeGateway.processPayment(data);
  }
}
