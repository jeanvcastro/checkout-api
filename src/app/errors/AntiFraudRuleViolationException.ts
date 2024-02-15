export class AntiFraudRuleViolationException extends Error {
  constructor() {
    super();
    this.message = "Antifraud rules violation";
    this.name = "AntiFraudRuleViolationException";
  }
}
