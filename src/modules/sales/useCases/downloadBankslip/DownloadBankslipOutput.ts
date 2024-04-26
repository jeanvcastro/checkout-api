export interface DownloadBankslipOutput {
  uuid: string;
  value: number;
  digitableLine: string | null;
  barcode: string | null;
  expiration: Date | null;
  url: string;
  customer: {
    name: string;
    email: string;
  };
  products: Array<{
    name: string;
    price: number;
  }>;
}
