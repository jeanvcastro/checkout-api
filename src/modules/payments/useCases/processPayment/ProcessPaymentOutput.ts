export interface ProcessPaymentOutput {
  status: "success" | "failure";
  uuid?: string;
  message?: string;
}
