export class ExpirationRequiredException extends Error {
  constructor() {
    super("Expiration is required for non-credit card payments.");
    this.name = "ExpirationRequiredException";
  }
}
