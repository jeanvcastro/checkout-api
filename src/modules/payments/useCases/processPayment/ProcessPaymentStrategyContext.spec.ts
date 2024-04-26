import { SaleConstants } from "@/core/domain/entities/Sale";
import { UndefinedPaymentStrategyException } from "@/core/domain/errors/UndefinedPaymentStrategyException";
import { type PaymentRequest } from "@/core/services/Payment/PaymentStrategy";
import { InvalidPaymentMethodException } from "@/modules/payments/errors/InvalidPaymentMethodException";
import { ProcessPaymentStrategyContext } from "@/modules/payments/useCases/processPayment/ProcessPaymentStrategyContext";
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
        paymentMethod: SaleConstants.PaymentMethod.CREDIT_CARD,
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
