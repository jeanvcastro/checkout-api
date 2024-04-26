import { type PaymentRequest, type PaymentResponse } from "./PaymentStrategy";

export interface PaymentGateway {
  processPayment: (data: PaymentRequest) => Promise<PaymentResponse>;
}
