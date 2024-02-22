import {
  type PaymentRequest,
  type PaymentResponse,
  type PaymentStrategy,
} from "@/domain/services/payments/PaymentStrategy";

export class PixStrategy implements PaymentStrategy {
  async processPayment(data: PaymentRequest): Promise<PaymentResponse> {
    throw new Error("Method not implemented.");
  }
}
