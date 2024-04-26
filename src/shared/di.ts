import { type CustomersRepository } from "@/core/domain/repositories/CustomersRepository";
import { type ProductsRepository } from "@/core/domain/repositories/ProductsRepository";
import { type SalesRepository } from "@/core/domain/repositories/SalesRepository";
import { type EmailService } from "@/core/services/EmailService";
import { type PDFService } from "@/core/services/PDFService";
import { type PaymentStrategyContext } from "@/core/services/Payment/PaymentStrategy";
import type StorageService from "@/core/services/StorageService";
import type TemplateService from "@/core/services/TemplateService";
import { SequelizeCustomersRepository } from "@/infra/repositories/SequelizeCustomersRepository";
import { SequelizeProductsRepository } from "@/infra/repositories/SequelizeProductsRepository";
import { SequelizeSalesRepository } from "@/infra/repositories/SequelizeSalesRepository";
import SESEmailService from "@/infra/services/Email/SESEmailService";
import WeasyPrintPDFService from "@/infra/services/PDF/WeasyprintPDFService";
import { LocalStorageService } from "@/infra/services/Storage/LocalStorageService";
import HandlebarsTemplateService from "@/infra/services/Template/HandlebarsTemplateService";
import { ProcessPaymentStrategyContext } from "@/modules/payments/useCases/processPayment/ProcessPaymentStrategyContext";

interface Dependencies {
  // repositories
  CustomersRepository: CustomersRepository;
  ProductsRepository: ProductsRepository;
  SalesRepository: SalesRepository;
  // services
  TemplateService: TemplateService;
  EmailService: EmailService;
  PaymentStrategyContext: PaymentStrategyContext;
  PDFService: PDFService;
  StorageService: StorageService;
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

  container.add("TemplateService", () => new HandlebarsTemplateService());
  container.add("EmailService", ({ TemplateService }) => new SESEmailService(TemplateService));
  container.add("PDFService", () => new WeasyPrintPDFService());
  container.add("StorageService", () => new LocalStorageService());
  container.add("PaymentStrategyContext", () => new ProcessPaymentStrategyContext());

  return container;
}

export type AppDIContainer = ReturnType<typeof configureDI>;
