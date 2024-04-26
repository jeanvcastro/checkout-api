import { InvalidParameterException } from "../errors/InvalidParameterException";

export class CPF {
  value: string;

  constructor(value: string) {
    const cleanValue = value.replace(/\D/g, "");

    if (!this.validate(cleanValue)) {
      throw new InvalidParameterException(this.constructor.name, cleanValue);
    }
    this.value = cleanValue;
  }

  private validate(value: string): boolean {
    if (value.length !== 11 || /^(\d)\1{10}$/.test(value)) return false;

    const checkDigit1 = this.calculateCheckDigit(value, 10, 9);
    const checkDigit2 = this.calculateCheckDigit(value, 11, 10);

    return checkDigit1 === parseInt(value[9]) && checkDigit2 === parseInt(value[10]);
  }

  private calculateCheckDigit(value: string, factor: number, max: number): number {
    let total = 0;
    for (let i = 0; i < max; ++i) {
      total += parseInt(value[i]) * (factor - i);
    }
    const remainder = (total * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  }
}
