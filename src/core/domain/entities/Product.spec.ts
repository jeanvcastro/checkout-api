import { describe, expect, it } from "vitest";
import { ValueNegativeException } from "../errors/ValueNegativeException";
import { ValueTooHighException } from "../errors/ValueTooHighException";
import { ValueTooLowException } from "../errors/ValueTooLowException";
import { Product } from "./Product";

describe("Product", () => {
  it("should throw ValueNegativeException for negative price", () => {
    expect(() => new Product({ name: "any_name", price: -100 })).toThrow(ValueNegativeException);
  });

  it("should throw ValueTooLowException for price lower than 500", () => {
    expect(() => new Product({ name: "any_name", price: 100 })).toThrow(ValueTooLowException);
  });

  it("should throw ValueTooHighException for price higher than 500000", () => {
    expect(() => new Product({ name: "any_name", price: 500001 })).toThrow(ValueTooHighException);
  });

  it("should create a Product instance with valid price", () => {
    const product = new Product({ name: "any_name", price: 1000 });
    expect(product.price).toBe(1000);
  });
});
