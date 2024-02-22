import { type ProcessPaymentInput } from "@/app/useCases/processPayment/ProcessPaymentInput";
import { type Customer } from "@/domain/entities/Customer";
import { type Product } from "@/domain/entities/Product";
import { type Sale } from "@/domain/entities/Sale";
import { type PaymentRequest, type PaymentResponse } from "@/domain/services/payments/PaymentStrategy";
import { type Installment } from "@/domain/valueObjects/InstallmentCalculator";

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
