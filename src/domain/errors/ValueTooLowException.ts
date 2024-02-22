export class ValueTooLowException extends Error {
  constructor() {
    super();
    this.message = "Value cannot be lower than 500";
    this.name = "ValueTooLowException";
  }
}
