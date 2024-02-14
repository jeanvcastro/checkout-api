import { InvalidParameterException } from "../errors/InvalidParameterException";

export class CNPJ {
  value: string;

  constructor(value: string) {
    const cleanValue = value.replace(/\D/g, "");
    if (!this.validate(cleanValue)) {
      throw new InvalidParameterException(this.constructor.name, cleanValue);
    }
    this.value = cleanValue;
  }

  private validate(value: string): boolean {
    if (value.length !== 14) return false;
    if (new Set(value).size === 1) return false;

    return this.validateDigits(value, 12) && this.validateDigits(value, 13);
  }

  private validateDigits(cnpj: string, length: number): boolean {
    const numbers = cnpj.substring(0, length);
    let index = length - 7;
    let sum = 0;
    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * index--;
      if (index < 2) index = 9;
    }
    const result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return result === parseInt(cnpj.charAt(length));
  }
}
