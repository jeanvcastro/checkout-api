import { type Customer } from "@/core/domain/entities/Customer";
import { type Product } from "@/core/domain/entities/Product";
import { type Sale } from "@/core/domain/entities/Sale";
import { type Installment } from "@/core/domain/valueObjects/InstallmentCalculator";
import { type PaymentRequest, type PaymentResponse } from "@/core/services/Payment/PaymentStrategy";
import { type ProcessPaymentInput } from "@/modules/payments/useCases/processPayment/ProcessPaymentInput";

export interface Context {
  customer: Customer;
  products: Product[];
  sale: Sale;
  installment: Installment | undefined;
  paymentRequest: PaymentRequest;
  paymentResponse: PaymentResponse;
  input: ProcessPaymentInput;
}

export abstract class PaymentHandler {
  private nextHandler: PaymentHandler | null = null;

  public setNext(handler: PaymentHandler): PaymentHandler {
    this.nextHandler = handler;
    return handler;
  }

  public async handle(context: Context | Partial<Context>): Promise<void> {
    if (this.nextHandler) {
      await this.nextHandler.handle(context);
    }
  }
}
