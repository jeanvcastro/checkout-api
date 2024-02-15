export interface ProcessPaymentOutput {
  status: "success" | "failure";
  saleUuid?: string;
  message?: string;
}
