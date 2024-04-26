export class ValueNegativeException extends Error {
  constructor() {
    super();
    this.message = "Value cannot be negative";
    this.name = "ValueNegativeException";
  }
}
