import { type Sale, type SaleConstants } from "@/domain/entities/Sale";

interface PaymentResponse {
  status: SaleConstants.Status;
  gatewayTransactionId: string;
  creditCardBrand: string | null;
  digitableLine: string | null;
  barcode: string | null;
  qrcode: string | null;
  expiration: Date | null;
}

export interface PaymentStrategy {
  processPayment: (sale: Sale) => Promise<PaymentResponse>;
}
