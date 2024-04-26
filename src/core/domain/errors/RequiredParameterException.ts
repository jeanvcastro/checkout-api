export class RequiredParameterException extends Error {
  constructor(paramName: string) {
    super();
    this.message = `${paramName} is required.`;
    this.name = "RequiredParameterException";
  }
}
