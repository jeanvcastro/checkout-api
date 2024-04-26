import { type SaleConstants } from "@/core/domain/entities/Sale";

export interface ShowSaleOutput {
  uuid: string;
  value: number;
  status: SaleConstants.Status;
  paymentMethod: SaleConstants.PaymentMethod;
  creditCardBrand: string | null;
  installments: number | null;
  installmentsValue: number | null;
  digitableLine: string | null;
  barcode: string | null;
  qrcode: string | null;
  expiration: Date | null;
  customer: {
    name: string;
    email: string;
  };
  products: Array<{
    name: string;
    price: number;
  }>;
}
