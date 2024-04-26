import { describe, expect, it } from "vitest";
import { InvalidParameterException } from "../errors/InvalidParameterException";
import { CPF } from "./CPF";

describe("CPF", () => {
  it("should throw InvalidParameterException for invalid CPF", () => {
    const invalidCPFs = ["12345678901", "00000000000", "11111111111"];
    invalidCPFs.forEach((cpf) => {
      expect(() => new CPF(cpf)).toThrow(InvalidParameterException);
    });
  });

  it("should create a CPF instance with valid CPF", () => {
    const validCPF = "12345678909";
    const cpf = new CPF(validCPF);
    expect(cpf.value).toBe(validCPF.replace(/\D/g, ""));
  });
});
