export class TooManyPaymentAttemptsException extends Error {
  constructor() {
    super("Number of payment attempts exceeded the allowed limit.");
    this.name = "TooManyPaymentAttemptsException";
  }
}
