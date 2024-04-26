import { describe, expect, it } from "vitest";
import { InstallmentCalculator } from "./InstallmentCalculator";

describe("InstallmentCalculator", () => {
  it("calculates a single installment without interest for amounts under R$10", () => {
    const calculator = new InstallmentCalculator(900, 12, 2.99, 1);
    expect(calculator.result).toEqual([{ number: 1, value: 900, interest: 0 }]);
  });

  it("calculates multiple installments with interest starting from the second installment", () => {
    const calculator = new InstallmentCalculator(12000, 3, 2.99, 1);
    const installments = calculator.result;
    expect(installments.length).toBe(3);
    expect(installments[0].interest).toBe(0);
    expect(installments[1].interest).toBeGreaterThan(0);
    expect(installments[2].interest).toBeGreaterThan(0);
  });

  it("ensures minimum installment value is R$5.00", () => {
    const calculator = new InstallmentCalculator(1500, 12, 2.99, 1);
    expect(calculator.result.length).toBeLessThanOrEqual(3);
  });

  it("calculates interest correctly for installments beyond the no-interest period", () => {
    const calculator = new InstallmentCalculator(10000, 2, 2.99, 1);
    const installments = calculator.result;
    expect(installments[1].interest).toBeCloseTo((installments[1].value - 5000) * 1, -2);
  });

  it("handles a large amount with multiple installments correctly", () => {
    const amount = 60000;
    const maxInstallments = 12;
    const noInterestInstallments = 1;
    const calculator = new InstallmentCalculator(amount, maxInstallments, 2.99, noInterestInstallments);
    const installments = calculator.result;

    expect(installments.length).toBeLessThanOrEqual(maxInstallments);
    installments.forEach((installment) => {
      expect(installment.value).toBeGreaterThanOrEqual(500);
    });

    expect(installments[0].interest).toBe(0);
    for (let i = 1; i < installments.length; i++) {
      expect(installments[i].interest).toBeGreaterThan(0);
    }
  });
});
