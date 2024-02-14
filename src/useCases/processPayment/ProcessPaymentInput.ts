import { type SaleConstants } from "@/domain/entities/Sale";

export interface ProcessPaymentInput {
  products: string[];
  paymentMethod: SaleConstants.PaymentMethod;
  installments?: number;
  customer: {
    name: string;
    email: string;
    document: string;
    phone: string;
  };
}
