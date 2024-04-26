export interface Installment {
  number: number;
  value: number;
  interest: number;
}

export class InstallmentCalculator {
  private readonly _installments: Installment[] = [];

  constructor(
    amount: number,
    maxInstallments: number,
    interestRate: number = 2.99,
    noInterestInstallments: number = 1,
  ) {
    this.calculateInstallments(amount, maxInstallments, interestRate / 100, noInterestInstallments);
  }

  private calculateInstallments(
    amount: number,
    maxInstallments: number,
    interestRate: number,
    noInterestInstallments: number,
  ): void {
    const minInstallmentValue = 500;
    let effectiveInstallments = Math.min(maxInstallments, Math.floor(amount / minInstallmentValue));

    effectiveInstallments = Math.max(effectiveInstallments, 1);

    for (let i = 1; i <= effectiveInstallments; i++) {
      let value, interest;

      if (i <= noInterestInstallments) {
        value = amount / effectiveInstallments;
        interest = 0;
      } else {
        const rate = Math.pow(1 + interestRate, i - noInterestInstallments);
        value = (amount * rate) / effectiveInstallments;
        interest = (value - amount / effectiveInstallments) * (i - noInterestInstallments);
      }

      this._installments.push({
        number: i,
        value: Math.round(value),
        interest: Math.round(interest),
      });
    }
  }

  public get result(): Installment[] {
    return this._installments;
  }
}
