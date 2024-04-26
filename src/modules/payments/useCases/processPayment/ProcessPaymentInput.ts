import { type SaleConstants } from "@/core/domain/entities/Sale";

export interface ProcessPaymentInput {
  products: string[];
  paymentMethod: SaleConstants.PaymentMethod;
  customer: {
    name: string;
    email: string;
    document: string;
    phone: string;
  };
  installments?: number;
  creditCard?: {
    name: string;
    number: string;
    expiration: string;
    cvv: string;
  };
}
