import { describe, expect, it } from "vitest";
import { InvalidParameterException } from "../errors/InvalidParameterException";
import { Customer } from "./Customer";

describe("Customer", () => {
  it("should create a Customer instance with a valid CPF", () => {
    const customer = new Customer({
      name: "any_name",
      document: "123.456.789-09",
      email: "any@email.com",
      phone: "any_phone",
    });
    expect(customer.document).toBe("12345678909");
  });

  it("should create a Customer instance with a valid CNPJ", () => {
    const customer = new Customer({
      name: "any_name",
      document: "94.002.902/0001-00",
      email: "any@email.com",
      phone: "any_phone",
    });
    expect(customer.document).toBe("94002902000100");
  });

  it("should throw InvalidParameterException for invalid CPF", () => {
    expect(
      () =>
        new Customer({
          name: "any_name",
          document: "invalid_cnpj",
          email: "any@email.com",
          phone: "any_phone",
        }),
    ).toThrow(InvalidParameterException);
  });

  it("should throw InvalidParameterException for invalid CNPJ", () => {
    expect(
      () =>
        new Customer({
          name: "any_name",
          document: "invalid_cnpj",
          email: "any@email.com",
          phone: "any_phone",
        }),
    ).toThrow(InvalidParameterException);
  });

  it("should throw InvalidParameterException for document with invalid length", () => {
    expect(
      () =>
        new Customer({
          name: "any_name",
          document: "short",
          email: "any@email.com",
          phone: "any_phone",
        }),
    ).toThrow(InvalidParameterException);
  });
});
