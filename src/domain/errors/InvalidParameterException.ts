export class InvalidParameterException extends Error {
  constructor(paramName: string, value: string) {
    super();
    this.message = `The value "${value}" is invalid for "${paramName}".`;
    this.name = "InvalidParameterException";
  }
}
