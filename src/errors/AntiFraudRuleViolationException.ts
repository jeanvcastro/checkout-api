export class AntiFraudRuleViolationException extends Error {
  constructor() {
    super("Antifraud rules violation");
    this.name = "AntiFraudRuleViolationException";
  }
}
