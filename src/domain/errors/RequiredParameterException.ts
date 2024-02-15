export class RequiredParameterException extends Error {
  constructor(paramName: string) {
    super(`${paramName} is required for non-credit card payments.`);
    this.name = "RequiredParameterException";
  }
}
