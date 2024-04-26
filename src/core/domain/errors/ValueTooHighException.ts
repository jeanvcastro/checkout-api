export class ValueTooHighException extends Error {
  constructor() {
    super();
    this.message = "Value cannot be higher than 500000";
    this.name = "ValueTooHighException";
  }
}
