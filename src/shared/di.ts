import { type QueueManager } from "@/core/QueueManager";
import { type CustomersRepository } from "@/core/domain/repositories/CustomersRepository";
import { type ProductsRepository } from "@/core/domain/repositories/ProductsRepository";
import { type SalesRepository } from "@/core/domain/repositories/SalesRepository";
import { type EmailService } from "@/core/services/EmailService";
import type Logger from "@/core/services/Logger";
import { type PDFService } from "@/core/services/PDFService";
import { type PaymentStrategyContext } from "@/core/services/Payment/PaymentStrategy";
import type StorageService from "@/core/services/StorageService";
import type TemplateService from "@/core/services/TemplateService";
import BullQueueManager from "@/infra/queue/BullQueueManager";
import { SequelizeCustomersRepository } from "@/infra/repositories/SequelizeCustomersRepository";
import { SequelizeProductsRepository } from "@/infra/repositories/SequelizeProductsRepository";
import { SequelizeSalesRepository } from "@/infra/repositories/SequelizeSalesRepository";
import SESEmailService from "@/infra/services/Email/SESEmailService";
import WinstonLogger from "@/infra/services/Logger/WinstonLogger";
import WeasyPrintPDFService from "@/infra/services/PDF/WeasyprintPDFService";
import { LocalStorageService } from "@/infra/services/Storage/LocalStorageService";
import HandlebarsTemplateService from "@/infra/services/Template/HandlebarsTemplateService";
import { ProcessPaymentController } from "@/modules/payments/useCases/processPayment/ProcessPaymentController";
import { ProcessPaymentStrategyContext } from "@/modules/payments/useCases/processPayment/ProcessPaymentStrategyContext";
import { ProcessPaymentUseCase } from "@/modules/payments/useCases/processPayment/ProcessPaymentUseCase";
import { DownloadBankslipController } from "@/modules/sales/useCases/downloadBankslip/DownloadBankslipController";
import { DownloadBankslipUseCase } from "@/modules/sales/useCases/downloadBankslip/DownloadBankslipUseCase";
import { ShowSaleController } from "@/modules/sales/useCases/showSale/ShowSaleController";
import { ShowSaleUseCase } from "@/modules/sales/useCases/showSale/ShowSaleUseCase";

interface Dependencies {
  // repositories
  CustomersRepository: CustomersRepository;
  ProductsRepository: ProductsRepository;
  SalesRepository: SalesRepository;
  // services
  Logger: Logger;
  QueueManager: QueueManager;
  TemplateService: TemplateService;
  EmailService: EmailService;
  PaymentStrategyContext: PaymentStrategyContext;
  PDFService: PDFService;
  StorageService: StorageService;
  // use cases
  ProcessPaymentUseCase: ProcessPaymentUseCase;
  ShowSaleUseCase: ShowSaleUseCase;
  DownloadBankslipUseCase: DownloadBankslipUseCase;
  // controllers
  ProcessPaymentController: ProcessPaymentController;
  ShowSaleController: ShowSaleController;
  DownloadBankslipController: DownloadBankslipController;
}

type Factory<T> = (dependencies: Dependencies) => T;

class DIContainer {
  private dependencies: Partial<Dependencies> = {};

  add<T extends keyof Dependencies>(key: T, resolver: Factory<Dependencies[T]>) {
    this.dependencies[key] = resolver(this.dependencies as Dependencies);
  }

  get<T extends keyof Dependencies>(key: T): Dependencies[T] {
    return this.dependencies[key] as Dependencies[T];
  }
}

export default function configureDI() {
  const container = new DIContainer();

  container.add("CustomersRepository", () => new SequelizeCustomersRepository());
  container.add("ProductsRepository", () => new SequelizeProductsRepository());
  container.add("SalesRepository", () => new SequelizeSalesRepository());

  container.add("Logger", () => new WinstonLogger());
  container.add("QueueManager", ({ Logger }) => new BullQueueManager(Logger));
  container.add("TemplateService", () => new HandlebarsTemplateService());
  container.add("EmailService", ({ TemplateService }) => new SESEmailService(TemplateService));
  container.add("PDFService", () => new WeasyPrintPDFService());
  container.add("StorageService", () => new LocalStorageService());
  container.add("PaymentStrategyContext", () => new ProcessPaymentStrategyContext());

  container.add(
    "ProcessPaymentUseCase",
    ({ CustomersRepository, ProductsRepository, SalesRepository, PaymentStrategyContext, QueueManager }) =>
      new ProcessPaymentUseCase(
        CustomersRepository,
        ProductsRepository,
        SalesRepository,
        PaymentStrategyContext,
        QueueManager,
      ),
  );
  container.add("ShowSaleUseCase", ({ SalesRepository }) => new ShowSaleUseCase(SalesRepository));
  container.add(
    "DownloadBankslipUseCase",
    ({ SalesRepository, StorageService, TemplateService, PDFService }) =>
      new DownloadBankslipUseCase(SalesRepository, StorageService, TemplateService, PDFService),
  );

  container.add(
    "ProcessPaymentController",
    ({ ProcessPaymentUseCase, Logger }) => new ProcessPaymentController(ProcessPaymentUseCase, Logger),
  );
  container.add("ShowSaleController", ({ ShowSaleUseCase, Logger }) => new ShowSaleController(ShowSaleUseCase, Logger));
  container.add(
    "DownloadBankslipController",
    ({ DownloadBankslipUseCase, Logger }) => new DownloadBankslipController(DownloadBankslipUseCase, Logger),
  );

  return container;
}

export type AppDIContainer = ReturnType<typeof configureDI>;
