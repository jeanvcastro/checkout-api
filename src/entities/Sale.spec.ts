import { ExpirationRequiredException } from "@/errors/ExpirationRequiredException";
import { TooManyPaymentAttemptsException } from "@/errors/TooManyPaymentAttemptsException";
import { ValueTooHighException } from "@/errors/ValueTooHighException";
import { ValueTooLowException } from "@/errors/ValueTooLowException";
import { describe, expect, it } from "vitest";
import { Customer } from "./Customer";
import { Product } from "./Product";
import { Sale, SaleConstants } from "./Sale";

const mockCustomer = new Customer({
  name: "Any Name",
  email: "any@email.com",
  document: "01234567890",
  phone: "any_phone",
});

const mockProduct = new Product({
  name: "any_name",
  price: 1000,
});

const mockProducts = [mockProduct];

describe("Sale", () => {
  it("should create a Sale instance with valid data", () => {
    const sale = new Sale({
      status: SaleConstants.Status.APPROVED,
      paymentMethod: SaleConstants.PaymentMethod.PIX,
      attempts: 1,
      expiration: new Date(),
      value: 5000,
      customer: mockCustomer,
      products: mockProducts,
    });
    expect(sale.status).toBe(SaleConstants.Status.APPROVED);
    expect(sale.paymentMethod).toBe(SaleConstants.PaymentMethod.PIX);
    expect(sale.value).toBe(5000);
  });

  it("should throw ValueTooLowException for value below 500", () => {
    expect(
      () =>
        new Sale({
          status: SaleConstants.Status.PENDING,
          paymentMethod: SaleConstants.PaymentMethod.BANK_SLIP,
          attempts: 1,
          expiration: new Date(),
          value: 499,
          customer: mockCustomer,
          products: mockProducts,
        }),
    ).toThrow(ValueTooLowException);
  });

  it("should throw ValueTooHighException for value above 500000", () => {
    expect(
      () =>
        new Sale({
          status: SaleConstants.Status.REFUSED,
          paymentMethod: SaleConstants.PaymentMethod.CREDIT_CARD,
          attempts: 1,
          value: 500001,
          customer: mockCustomer,
          products: mockProducts,
        }),
    ).toThrow(ValueTooHighException);
  });

  it("should require expiration for non-credit card payment methods", () => {
    expect(
      () =>
        new Sale({
          status: SaleConstants.Status.PENDING,
          paymentMethod: SaleConstants.PaymentMethod.PIX,
          attempts: 1,
          value: 1000,
          customer: mockCustomer,
          products: mockProducts,
        }),
    ).toThrow(ExpirationRequiredException);
  });

  it("should throw TooManyPaymentAttemptsException for a number of attempts greater than 5", () => {
    expect(
      () =>
        new Sale({
          status: SaleConstants.Status.PENDING,
          paymentMethod: SaleConstants.PaymentMethod.CREDIT_CARD,
          attempts: 6,
          value: 1000,
          customer: mockCustomer,
          products: mockProducts,
        }),
    ).toThrow(TooManyPaymentAttemptsException);
  });
});
