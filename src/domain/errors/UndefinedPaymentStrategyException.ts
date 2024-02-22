export class UndefinedPaymentStrategyException extends Error {
  constructor() {
    super();
    this.message = "Undefined payment strategy.";
    this.name = "UndefinedPaymentStrategyException";
  }
}
