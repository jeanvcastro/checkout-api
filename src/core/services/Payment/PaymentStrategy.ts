import { type SaleConstants } from "@/core/domain/entities/Sale";

interface PaymentProduct {
  id: string;
  name: string;
  price: number;
}

export interface PaymentRequest {
  amount: number;
  products: PaymentProduct[];
  customer: {
    name: string;
    email: string;
    document: string;
    phone: string;
  };
  paymentMethod: SaleConstants.PaymentMethod;
  expiration?: Date;
  installments?: number;
  creditCard?: {
    name: string;
    number: string;
    expiration: string;
    cvv: string;
  };
}

export interface PaymentResponse {
  status: SaleConstants.Status;
  gatewayTransactionId: string;
  creditCardBrand: string | null;
  digitableLine: string | null;
  barcode: string | null;
  qrcode: string | null;
  expiration: Date | null;
}

export interface PaymentStrategyContext {
  setStrategy: (paymentMethod: SaleConstants.PaymentMethod) => void;
  processPayment: (data: PaymentRequest) => Promise<PaymentResponse>;
}

export interface PaymentStrategy {
  processPayment: (data: PaymentRequest) => Promise<PaymentResponse>;
}
