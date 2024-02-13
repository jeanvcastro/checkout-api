export class ValueNegativeException extends Error {
  constructor() {
    super("Value cannot be negative");
    this.name = "ValueNegativeException";
  }
}
