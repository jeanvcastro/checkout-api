export class ValueTooLowException extends Error {
  constructor() {
    super("Value cannot be lower than 500");
    this.name = "ValueTooLowException";
  }
}
