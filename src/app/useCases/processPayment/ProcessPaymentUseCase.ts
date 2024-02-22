import { type CustomersRepository } from "@/domain/data/repositories/CustomersRepository";
import { type ProductsRepository } from "@/domain/data/repositories/ProductsRepository";
import { type SalesRepository } from "@/domain/data/repositories/SalesRepository";
import { type Context } from "@/domain/services/payments/PaymentHandler";
import { type PaymentStrategyContext } from "@/domain/services/payments/PaymentStrategy";
import {
  ProcessPaymentHandler,
  SendNotificationHandler,
  SetCustomerHandler,
  SetProductsHandler,
  SetSaleHandler,
  VerifyAntifraudRulesHandler,
} from "./ProcessPaymentHandlers";
import { type ProcessPaymentInput } from "./ProcessPaymentInput";
import { type ProcessPaymentOutput } from "./ProcessPaymentOutput";

export class ProcessPaymentUseCase {
  constructor(
    private readonly customersRepository: CustomersRepository,
    private readonly productsRepository: ProductsRepository,
    private readonly salesRepository: SalesRepository,
    private readonly paymentStrategyContext: PaymentStrategyContext,
  ) {}

  async execute(input: ProcessPaymentInput): Promise<ProcessPaymentOutput> {
    this.paymentStrategyContext.setStrategy(input.paymentMethod);

    const verifyAntifraudRulesHandler = new VerifyAntifraudRulesHandler(this.customersRepository);
    const setCustomerHandler = new SetCustomerHandler(this.customersRepository);
    const setProductsHandler = new SetProductsHandler(this.productsRepository);
    const processPaymentHandler = new ProcessPaymentHandler(this.paymentStrategyContext);
    const setSaleHandler = new SetSaleHandler(this.salesRepository);
    const sendNotificationHandler = new SendNotificationHandler();

    verifyAntifraudRulesHandler.setNext(setCustomerHandler);
    setCustomerHandler.setNext(setProductsHandler);
    setProductsHandler.setNext(processPaymentHandler);
    processPaymentHandler.setNext(setSaleHandler);
    setSaleHandler.setNext(sendNotificationHandler);

    const context = {
      input,
    };
    await verifyAntifraudRulesHandler.handle(context);

    return {
      status: "success",
      saleUuid: (context as Context).sale.uuid.toString(),
    };
  }
}
