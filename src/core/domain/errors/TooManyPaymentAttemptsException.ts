export class TooManyPaymentAttemptsException extends Error {
  constructor() {
    super();
    this.message = "Number of payment attempts exceeded the allowed limit.";
    this.name = "TooManyPaymentAttemptsException";
  }
}
