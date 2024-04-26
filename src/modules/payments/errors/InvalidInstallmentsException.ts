export class InvalidInstallmentsException extends Error {
  constructor() {
    super();
    this.message = "Invalid number of installments";
    this.name = "InvalidInstallmentException";
  }
}
