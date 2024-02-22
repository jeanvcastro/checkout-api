import { InvalidPaymentMethodException } from "@/app/errors/InvalidPaymentMethodException";
import { BankSlipStrategy } from "@/app/services/payments/BankSlipStrategy";
import { CreditCardStrategy } from "@/app/services/payments/CreditCardStrategy";
import { PixStrategy } from "@/app/services/payments/PixStrategy";
import { SaleConstants } from "@/domain/entities/Sale";
import { UndefinedPaymentStrategyException } from "@/domain/errors/UndefinedPaymentStrategyException";
import {
  type PaymentRequest,
  type PaymentResponse,
  type PaymentStrategy,
  type PaymentStrategyContext,
} from "@/domain/services/payments/PaymentStrategy";

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
