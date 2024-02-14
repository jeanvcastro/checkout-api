import { describe, expect, it } from "vitest";
import { InvalidParameterException } from "../errors/InvalidParameterException";
import { CNPJ } from "./CNPJ";

describe("CNPJ", () => {
  it("should throw InvalidParameterException for invalid CNPJ", () => {
    const invalidCNPJs = ["12345678901234", "00000000000000", "11111111111111"];
    invalidCNPJs.forEach((cnpj) => {
      expect(() => new CNPJ(cnpj)).toThrow(InvalidParameterException);
    });
  });

  it("should create a CNPJ instance with valid CNPJ", () => {
    const validCNPJ = "11444777000161";
    const cnpj = new CNPJ(validCNPJ);
    expect(cnpj.value).toBe(validCNPJ.replace(/\D/g, ""));
  });
});
