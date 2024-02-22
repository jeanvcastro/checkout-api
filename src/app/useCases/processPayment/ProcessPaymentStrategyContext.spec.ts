import { InvalidPaymentMethodException } from "@/app/errors/InvalidPaymentMethodException";
import { ProcessPaymentStrategyContext } from "@/app/useCases/processPayment/ProcessPaymentStrategyContext";
import { type SaleConstants } from "@/domain/entities/Sale";
import { UndefinedPaymentStrategyException } from "@/domain/errors/UndefinedPaymentStrategyException";
import { type PaymentRequest } from "@/domain/services/payments/PaymentStrategy";
import { beforeEach, describe, expect, it } from "vitest";

describe("ProcessPaymentStrategyContext", () => {
  let context: ProcessPaymentStrategyContext;

  beforeEach(() => {
    context = new ProcessPaymentStrategyContext();
  });

  describe("setStrategy", () => {
    it("should throw InvalidPaymentMethodException for invalid payment method", () => {
      expect(() => {
        context.setStrategy("INVALID_METHOD" as SaleConstants.PaymentMethod);
      }).toThrow(InvalidPaymentMethodException);
    });
  });

  describe("processPayment", () => {
    it("should throw UndefinedPaymentStrategyException if strategy is not set", async () => {
      const data: PaymentRequest = {
        amount: 100,
        products: [{ id: "any_id", name: "any_name", price: 100 }],
        customer: {
          name: "Any Name",
          email: "any@email.com",
          document: "01234567890",
          phone: "any_phone",
        },
      };
      await expect(context.processPayment(data)).rejects.toThrow(UndefinedPaymentStrategyException);
    });
  });
});
