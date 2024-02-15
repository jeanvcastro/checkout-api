export class InvalidPaymentMethodException extends Error {
  constructor() {
    super("Invalid payment method");
    this.name = "InvalidPaymentMethodException";
  }
}
