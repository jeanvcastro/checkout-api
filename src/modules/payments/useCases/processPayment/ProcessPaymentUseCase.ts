import { type QueueManager } from "@/core/QueueManager";
import { SaleConstants } from "@/core/domain/entities/Sale";
import { type CustomersRepository } from "@/core/domain/repositories/CustomersRepository";
import { type ProductsRepository } from "@/core/domain/repositories/ProductsRepository";
import { type SalesRepository } from "@/core/domain/repositories/SalesRepository";
import { type Context } from "@/core/services/Payment/PaymentHandler";
import { type PaymentStrategyContext } from "@/core/services/Payment/PaymentStrategy";
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
    private readonly queueManager: QueueManager,
  ) {}

  async execute(input: ProcessPaymentInput): Promise<ProcessPaymentOutput> {
    this.paymentStrategyContext.setStrategy(input.paymentMethod);

    const verifyAntifraudRulesHandler = new VerifyAntifraudRulesHandler(this.customersRepository);
    const setCustomerHandler = new SetCustomerHandler(this.customersRepository);
    const setProductsHandler = new SetProductsHandler(this.productsRepository);
    const processPaymentHandler = new ProcessPaymentHandler(this.paymentStrategyContext);
    const setSaleHandler = new SetSaleHandler(this.salesRepository);
    const sendNotificationHandler = new SendNotificationHandler(this.queueManager);

    verifyAntifraudRulesHandler.setNext(setCustomerHandler);
    setCustomerHandler.setNext(setProductsHandler);
    setProductsHandler.setNext(processPaymentHandler);
    processPaymentHandler.setNext(setSaleHandler);
    setSaleHandler.setNext(sendNotificationHandler);

    const context = {
      input,
    };
    await verifyAntifraudRulesHandler.handle(context);

    const sale = (context as Context).sale;
    const status = [SaleConstants.Status.APPROVED, SaleConstants.Status.PENDING].includes(sale.status)
      ? "success"
      : "failure";

    return {
      status,
      uuid: sale.uuid.toString(),
      message: sale.status,
    };
  }
}
