import { SaleConstants } from "@/core/domain/entities/Sale";
import { UndefinedPaymentStrategyException } from "@/core/domain/errors/UndefinedPaymentStrategyException";
import {
  type PaymentRequest,
  type PaymentResponse,
  type PaymentStrategy,
  type PaymentStrategyContext,
} from "@/core/services/Payment/PaymentStrategy";
import { BankSlipStrategy } from "@/infra/services/Payment/Strategy/BankSlipStrategy";
import { CreditCardStrategy } from "@/infra/services/Payment/Strategy/CreditCardStrategy";
import { PixStrategy } from "@/infra/services/Payment/Strategy/PixStrategy";
import { InvalidPaymentMethodException } from "@/modules/payments/errors/InvalidPaymentMethodException";

export class ProcessPaymentStrategyContext implements PaymentStrategyContext {
  private strategy?: PaymentStrategy;

  public setStrategy(paymentMethod: SaleConstants.PaymentMethod): void {
    switch (paymentMethod) {
      case SaleConstants.PaymentMethod.CREDIT_CARD:
        this.strategy = new CreditCardStrategy();
        break;
      case SaleConstants.PaymentMethod.BANK_SLIP:
        this.strategy = new BankSlipStrategy();
        break;
      case SaleConstants.PaymentMethod.PIX:
        this.strategy = new PixStrategy();
        break;
      default:
        throw new InvalidPaymentMethodException();
    }
  }

  public async processPayment(data: PaymentRequest): Promise<PaymentResponse> {
    if (this.strategy === undefined) {
      throw new UndefinedPaymentStrategyException();
    }

    return await this.strategy.processPayment(data);
  }
}
