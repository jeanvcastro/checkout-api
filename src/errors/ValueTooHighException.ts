export class ValueTooHighException extends Error {
  constructor() {
    super("Value cannot be higher than 500000");
    this.name = "ValueTooHighException";
  }
}
