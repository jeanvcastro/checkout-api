import {
  type PaymentRequest,
  type PaymentResponse,
  type PaymentStrategy,
} from "@/domain/services/payments/PaymentStrategy";

export class CreditCardStrategy implements PaymentStrategy {
  async processPayment(data: PaymentRequest): Promise<PaymentResponse> {
    throw new Error("Method not implemented.");
  }
}
