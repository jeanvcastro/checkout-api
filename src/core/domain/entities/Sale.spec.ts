import { RequiredParameterException } from "@/core/domain/errors/RequiredParameterException";
import { TooManyPaymentAttemptsException } from "@/core/domain/errors/TooManyPaymentAttemptsException";
import { ValueTooHighException } from "@/core/domain/errors/ValueTooHighException";
import { ValueTooLowException } from "@/core/domain/errors/ValueTooLowException";
import { describe, expect, it } from "vitest";
import { Sale, SaleConstants } from "./Sale";

describe("Sale", () => {
  it("should create a Sale instance with valid data", () => {
    const sale = new Sale({
      customerId: 1,
      status: SaleConstants.Status.APPROVED,
      paymentMethod: SaleConstants.PaymentMethod.PIX,
      attempts: 1,
      gatewayTransactionId: "any_transaction_id",
      qrcode: "any_qrcode",
      expiration: new Date(),
      value: 5000,
    });
    expect(sale.status).toBe(SaleConstants.Status.APPROVED);
    expect(sale.paymentMethod).toBe(SaleConstants.PaymentMethod.PIX);
    expect(sale.value).toBe(5000);
  });

  it("should throw ValueTooLowException for value below 500", () => {
    expect(
      () =>
        new Sale({
          customerId: 1,
          status: SaleConstants.Status.PENDING,
          paymentMethod: SaleConstants.PaymentMethod.BANK_SLIP,
          attempts: 1,
          gatewayTransactionId: "any_transaction_id",
          expiration: new Date(),
          value: 499,
        }),
    ).toThrow(ValueTooLowException);
  });

  it("should throw ValueTooHighException for value above 500000", () => {
    expect(
      () =>
        new Sale({
          customerId: 1,
          status: SaleConstants.Status.REFUSED,
          paymentMethod: SaleConstants.PaymentMethod.CREDIT_CARD,
          attempts: 1,
          gatewayTransactionId: "any_transaction_id",
          value: 500001,
        }),
    ).toThrow(ValueTooHighException);
  });

  it("should throw RequiredParameterException for missing creditCardBrand when paymentMethod is CREDIT_CARD", () => {
    expect(
      () =>
        new Sale({
          customerId: 1,
          status: SaleConstants.Status.APPROVED,
          paymentMethod: SaleConstants.PaymentMethod.CREDIT_CARD,
          attempts: 1,
          gatewayTransactionId: "any_transaction_id",
          value: 5000,
          installments: 1,
          installmentsValue: 5000,
        }),
    ).toThrow(RequiredParameterException);
  });

  // Teste para installments requerido
  it("should throw RequiredParameterException for missing installments when paymentMethod is CREDIT_CARD", () => {
    expect(
      () =>
        new Sale({
          customerId: 1,
          status: SaleConstants.Status.APPROVED,
          paymentMethod: SaleConstants.PaymentMethod.CREDIT_CARD,
          attempts: 1,
          gatewayTransactionId: "any_transaction_id",
          value: 5000,
          creditCardBrand: "VISA",
          installmentsValue: 5000,
        }),
    ).toThrow(RequiredParameterException);
  });

  it("should throw RequiredParameterException for missing installmentsValue when paymentMethod is CREDIT_CARD", () => {
    expect(
      () =>
        new Sale({
          customerId: 1,
          status: SaleConstants.Status.APPROVED,
          paymentMethod: SaleConstants.PaymentMethod.CREDIT_CARD,
          attempts: 1,
          gatewayTransactionId: "any_transaction_id",
          value: 5000,
          creditCardBrand: "VISA",
          installments: 1,
        }),
    ).toThrow(RequiredParameterException);
  });

  it("should throw RequiredParameterException for missing digitableLine when paymentMethod is BANK_SLIP", () => {
    expect(
      () =>
        new Sale({
          customerId: 1,
          status: SaleConstants.Status.APPROVED,
          paymentMethod: SaleConstants.PaymentMethod.BANK_SLIP,
          attempts: 1,
          gatewayTransactionId: "any_transaction_id",
          value: 5000,
        }),
    ).toThrow(RequiredParameterException);
  });

  it("should throw RequiredParameterException for missing barcode when paymentMethod is BANK_SLIP", () => {
    expect(
      () =>
        new Sale({
          customerId: 1,
          status: SaleConstants.Status.APPROVED,
          paymentMethod: SaleConstants.PaymentMethod.BANK_SLIP,
          attempts: 1,
          gatewayTransactionId: "any_transaction_id",
          value: 5000,
        }),
    ).toThrow(RequiredParameterException);
  });

  it("should throw RequiredParameterException for missing qrcode when paymentMethod is PIX", () => {
    expect(
      () =>
        new Sale({
          customerId: 1,
          status: SaleConstants.Status.APPROVED,
          paymentMethod: SaleConstants.PaymentMethod.PIX,
          attempts: 1,
          gatewayTransactionId: "any_transaction_id",
          value: 5000,
        }),
    ).toThrow(RequiredParameterException);
  });

  it("should throw RequiredParameterException for missing expiration when paymentMethod is non-credit card", () => {
    expect(
      () =>
        new Sale({
          customerId: 1,
          status: SaleConstants.Status.PENDING,
          paymentMethod: SaleConstants.PaymentMethod.PIX,
          attempts: 1,
          gatewayTransactionId: "any_transaction_id",
          value: 1000,
        }),
    ).toThrow(RequiredParameterException);
  });

  it("should throw TooManyPaymentAttemptsException for a number of attempts greater than 5", () => {
    expect(
      () =>
        new Sale({
          customerId: 1,
          status: SaleConstants.Status.PENDING,
          paymentMethod: SaleConstants.PaymentMethod.CREDIT_CARD,
          attempts: 6,
          gatewayTransactionId: "any_transaction_id",
          value: 1000,
        }),
    ).toThrow(TooManyPaymentAttemptsException);
  });
});
