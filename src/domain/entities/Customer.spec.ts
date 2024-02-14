import { describe, expect, it } from "vitest";
import { InvalidParameterException } from "../errors/InvalidParameterException";
import { Customer } from "./Customer";

describe("Customer", () => {
  it("should trim whitespace from the beginning and end of the name", () => {
    const name = "   Any Name   ";
    const expectedName = "Any Name";
    const customer = new Customer({
      name,
      document: "123.456.789-09",
      email: "any@email.com",
      phone: "any_phone",
    });
    expect(customer.name).toBe(expectedName);
  });

  it("should throw InvalidParameterException for names with numbers", () => {
    const nameWithNumbers = "Any Name 123";
    expect(
      () =>
        new Customer({
          name: nameWithNumbers,
          document: "123.456.789-09",
          email: "any@email.com",
          phone: "any_phone",
        }),
    ).toThrow(InvalidParameterException);
  });

  it("should throw InvalidParameterException for names with special characters", () => {
    const nameWithSpecialChars = "Any@Name!";
    expect(
      () =>
        new Customer({
          name: nameWithSpecialChars,
          document: "123.456.789-09",
          email: "any@email.com",
          phone: "any_phone",
        }),
    ).toThrow(InvalidParameterException);
  });

  it("should create a Customer instance with a valid CPF", () => {
    const customer = new Customer({
      name: "Any Name",
      document: "123.456.789-09",
      email: "any@email.com",
      phone: "any_phone",
    });
    expect(customer.document).toBe("12345678909");
  });

  it("should create a Customer instance with a valid CNPJ", () => {
    const customer = new Customer({
      name: "Any Name",
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
          name: "Any Name",
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
          name: "Any Name",
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
          name: "Any Name",
          document: "short",
          email: "any@email.com",
          phone: "any_phone",
        }),
    ).toThrow(InvalidParameterException);
  });
});
