import { Customer } from "@/core/domain/entities/Customer";
import { Product } from "@/core/domain/entities/Product";
import { Sale, SaleConstants } from "@/core/domain/entities/Sale";
import { type CustomersRepository } from "@/core/domain/repositories/CustomersRepository";
import { type ProductsRepository } from "@/core/domain/repositories/ProductsRepository";
import { type SalesRepository } from "@/core/domain/repositories/SalesRepository";
import { type Context } from "@/core/services/Payment/PaymentHandler";
import {
  type PaymentRequest,
  type PaymentResponse,
  type PaymentStrategyContext,
} from "@/core/services/Payment/PaymentStrategy";
import { AntiFraudRuleViolationException } from "@/modules/payments/errors/AntiFraudRuleViolationException";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ProcessPaymentHandler,
  SetCustomerHandler,
  SetProductsHandler,
  SetSaleHandler,
  VerifyAntifraudRulesHandler,
} from "./ProcessPaymentHandlers";

const customersRepository = vi.mocked<Partial<CustomersRepository>>({}) as CustomersRepository;
const productsRepository = vi.mocked<Partial<ProductsRepository>>({}) as ProductsRepository;
const salesRepository = vi.mocked<Partial<SalesRepository>>({}) as SalesRepository;

let baseContext: Partial<Context>;

let mockedCustomer: Customer;
let mockedProduct: Product;
let mockedSale: Sale;

let mockedPaymentRequest: PaymentRequest;
let mockedPaymentResponse: PaymentResponse;
let paymentStrategyContext: PaymentStrategyContext;

describe("ProcessPaymentHandlers", () => {
  beforeEach(() => {
    const inputCustomer = { name: "Any Name", document: "01234567890", email: "any@email", phone: "any_phone" };
    const paymentMethod = SaleConstants.PaymentMethod.CREDIT_CARD;

    baseContext = {
      input: {
        customer: inputCustomer,
        products: ["any_uuid"],
        paymentMethod,
        installments: 1,
        creditCard: {
          name: "Any Name",
          number: "1234567890123456",
          expiration: "12/2022",
          cvv: "123",
        },
      },
    };

    mockedPaymentResponse = {
      status: SaleConstants.Status.APPROVED,
      gatewayTransactionId: "any_transaction_id",
      creditCardBrand: "any_brand",
      digitableLine: null,
      barcode: null,
      qrcode: null,
      expiration: null,
    };

    mockedCustomer = new Customer(inputCustomer);
    mockedProduct = new Product({ name: "any_name", price: 500 });
    mockedSale = new Sale({
      customerId: mockedCustomer.id,
      status: SaleConstants.Status.APPROVED,
      paymentMethod,
      value: mockedProduct.price,
      attempts: 1,
      gatewayTransactionId: mockedPaymentResponse.gatewayTransactionId,
      creditCardBrand: mockedPaymentResponse.creditCardBrand,
      installments: 1,
      installmentsValue: mockedProduct.price,
      digitableLine: mockedPaymentResponse.digitableLine,
      barcode: mockedPaymentResponse.barcode,
      qrcode: mockedPaymentResponse.qrcode,
      expiration: mockedPaymentResponse.expiration,
    });

    mockedPaymentRequest = {
      amount: mockedProduct.price,
      customer: inputCustomer,
      paymentMethod,
      products: [
        {
          id: mockedProduct.uuid.toString(),
          name: mockedProduct.name,
          price: mockedProduct.price,
        },
      ],
    };

    paymentStrategyContext = {
      setStrategy: vi.fn(),
      processPayment: vi.fn().mockResolvedValue(mockedPaymentResponse),
    };
  });

  describe("VerifyAntifraudRulesHandler", () => {
    it("should throw an exception if anti-fraud rules are violated", async () => {
      customersRepository.countCustomersByNameInPeriod = vi.fn().mockResolvedValue(6);

      const handler = new VerifyAntifraudRulesHandler(customersRepository);

      await expect(handler.handle(baseContext)).rejects.toThrow(AntiFraudRuleViolationException);
    });

    it("should proceed without error if no anti-fraud rules are violated", async () => {
      customersRepository.countCustomersByNameInPeriod = vi.fn().mockResolvedValue(0);
      customersRepository.countCustomersByDocumentInPeriod = vi.fn().mockResolvedValue(0);
      customersRepository.countCustomersByEmailInPeriod = vi.fn().mockResolvedValue(0);
      customersRepository.countCustomersByPhoneInPeriod = vi.fn().mockResolvedValue(0);

      const handler = new VerifyAntifraudRulesHandler(customersRepository);

      await expect(handler.handle(baseContext)).resolves.not.toThrow();
    });
  });

  describe("SetCustomerHandler", () => {
    it("should create a new customer if not existing", async () => {
      customersRepository.findByDocument = vi.fn().mockResolvedValue(null);
      customersRepository.create = vi.fn().mockResolvedValue(mockedCustomer);

      const handler = new SetCustomerHandler(customersRepository);
      await handler.handle(baseContext as Context);

      expect(customersRepository.create).toHaveBeenCalled();
    });

    it("should update an existing customer", async () => {
      customersRepository.findByDocument = vi.fn().mockResolvedValue(mockedCustomer);
      customersRepository.update = vi.fn().mockResolvedValue(mockedCustomer);

      const handler = new SetCustomerHandler(customersRepository);
      await handler.handle(baseContext as Context);

      expect(customersRepository.update).toHaveBeenCalled();
    });
  });

  describe("SetProductsHandler", () => {
    it("should set products in the context", async () => {
      productsRepository.findByUuid = vi.fn().mockResolvedValue(mockedProduct);

      const handler = new SetProductsHandler(productsRepository);
      await handler.handle(baseContext as Context);

      expect(baseContext.products).toEqual([mockedProduct]);
    });
  });

  describe("ProcessPaymentHandler", () => {
    it("should process payment with credit card successfully", async () => {
      paymentStrategyContext.processPayment = vi.fn().mockResolvedValue({ status: SaleConstants.Status.APPROVED });

      const handler = new ProcessPaymentHandler(paymentStrategyContext);

      const context = {
        ...baseContext,
        products: [mockedProduct],
        customer: mockedCustomer,
        installment: {
          number: baseContext.input?.installments ?? 0,
          value: mockedProduct.price,
          interest: 0,
        },
        paymentRequest: mockedPaymentRequest,
      };
      await handler.handle(context as Context);

      expect(paymentStrategyContext.processPayment).toHaveBeenCalled();
      expect(context.paymentResponse?.status).toBe(SaleConstants.Status.APPROVED);
    });

    it("should process payment with BANK_SLIP successfully", async () => {
      const context = {
        ...baseContext,
        input: {
          ...baseContext.input,
          paymentMethod: SaleConstants.PaymentMethod.BANK_SLIP,
        },
        products: [mockedProduct],
        customer: mockedCustomer,
      };

      paymentStrategyContext.processPayment = vi.fn().mockResolvedValue({
        status: SaleConstants.Status.PENDING,
        paymentMethod: SaleConstants.PaymentMethod.BANK_SLIP,
      });

      const handler = new ProcessPaymentHandler(paymentStrategyContext);
      await handler.handle(context as Context);

      expect(paymentStrategyContext.processPayment).toHaveBeenCalled();
      expect(context.paymentResponse?.status).toBe(SaleConstants.Status.PENDING);
    });

    it("should process payment with PIX successfully", async () => {
      const context = {
        ...baseContext,
        input: {
          ...baseContext.input,
          paymentMethod: SaleConstants.PaymentMethod.PIX,
        },
        products: [mockedProduct],
        customer: mockedCustomer,
      };

      paymentStrategyContext.processPayment = vi.fn().mockResolvedValue({
        status: SaleConstants.Status.APPROVED,
        paymentMethod: SaleConstants.PaymentMethod.PIX,
      });

      const handler = new ProcessPaymentHandler(paymentStrategyContext);
      await handler.handle(context as Context);

      expect(paymentStrategyContext.processPayment).toHaveBeenCalled();
      expect(context.paymentResponse?.status).toBe(SaleConstants.Status.APPROVED);
    });

    it("should handle errors during payment process", async () => {
      const context = {
        ...baseContext,
        input: {
          ...baseContext.input,
          paymentMethod: SaleConstants.PaymentMethod.CREDIT_CARD,
        },
        products: [mockedProduct],
        customer: mockedCustomer,
      };

      const errorMessage = "Payment processing error";
      paymentStrategyContext.processPayment = vi.fn().mockRejectedValue(new Error(errorMessage));

      const handler = new ProcessPaymentHandler(paymentStrategyContext);
      await expect(handler.handle(context as Context)).rejects.toThrow(errorMessage);
    });
  });

  describe("SetSaleHandler", () => {
    it("should create a new sale if not existing", async () => {
      const handler = new SetSaleHandler(salesRepository);

      salesRepository.findByProductsAndCustomer = vi.fn().mockResolvedValue(null);
      salesRepository.create = vi.fn().mockResolvedValue(mockedSale);

      const context = {
        ...baseContext,
        products: [mockedProduct],
        customer: mockedCustomer,
        installment: {
          number: baseContext.input?.installments ?? 0,
          value: mockedProduct.price,
          interest: 0,
        },
        paymentResponse: mockedPaymentResponse,
        paymentRequest: mockedPaymentRequest,
      };

      await handler.handle(context as Context);

      expect(salesRepository.create).toHaveBeenCalled();
    });

    it("should update an existing sale", async () => {
      salesRepository.findByProductsAndCustomer = vi.fn().mockResolvedValue(mockedSale);
      salesRepository.update = vi.fn().mockResolvedValue({ ...mockedSale, attempts: mockedSale.attempts + 1 });

      const handler = new SetSaleHandler(salesRepository);
      const context = {
        ...baseContext,
        products: [mockedProduct],
        customer: mockedCustomer,
        sale: mockedSale,
        paymentResponse: mockedPaymentResponse,
      };

      await handler.handle(context as Context);

      expect(salesRepository.update).toHaveBeenCalled();
      expect(context.sale?.attempts).toBeGreaterThan(1);
    });
  });

  describe("SendNotificationHandler", () => {
    it("should send notification after sale processing", async () => {});
  });
});
