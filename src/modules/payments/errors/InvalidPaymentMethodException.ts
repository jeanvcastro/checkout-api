export class InvalidPaymentMethodException extends Error {
  constructor() {
    super();
    this.message = "Invalid payment method";
    this.name = "InvalidPaymentMethodException";
  }
}
