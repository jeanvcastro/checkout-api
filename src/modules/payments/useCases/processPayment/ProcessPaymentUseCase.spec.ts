import { type QueueManager } from "@/core/QueueManager";
import { Customer } from "@/core/domain/entities/Customer";
import { Product } from "@/core/domain/entities/Product";
import { Sale, SaleConstants } from "@/core/domain/entities/Sale";
import { type CustomersRepository } from "@/core/domain/repositories/CustomersRepository";
import { type ProductsRepository } from "@/core/domain/repositories/ProductsRepository";
import { type SalesRepository } from "@/core/domain/repositories/SalesRepository";
import { UUID } from "@/core/domain/valueObjects/UUID";
import { type PaymentResponse, type PaymentStrategyContext } from "@/core/services/Payment/PaymentStrategy";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type ProcessPaymentInput } from "./ProcessPaymentInput";
import { ProcessPaymentUseCase } from "./ProcessPaymentUseCase";

describe("ProcessPaymentUseCase", () => {
  const customersRepository = vi.mocked<Partial<CustomersRepository>>({}) as CustomersRepository;
  const productsRepository = vi.mocked<Partial<ProductsRepository>>({}) as ProductsRepository;
  const salesRepository = vi.mocked<Partial<SalesRepository>>({}) as SalesRepository;

  let mockedPaymentResponse: PaymentResponse;
  let paymentStrategyContext: PaymentStrategyContext;
  let queueManager: QueueManager;

  let mockedProduct: Product;
  let mockedCustomer: Customer;
  let mockedSale: Sale;

  beforeEach(() => {
    mockedProduct = new Product({
      uuid: new UUID().toString(),
      name: "any_name",
      price: 500,
    });

    mockedCustomer = new Customer({
      name: "Any Name",
      document: "01234567890",
      email: "any@email",
      phone: "any_phone",
    });

    mockedPaymentResponse = {
      status: SaleConstants.Status.APPROVED,
      gatewayTransactionId: "any_transaction_id",
      creditCardBrand: "any_brand",
      digitableLine: null,
      barcode: null,
      qrcode: null,
      expiration: null,
    };

    mockedSale = new Sale({
      customerId: 1,
      status: SaleConstants.Status.APPROVED,
      paymentMethod: SaleConstants.PaymentMethod.CREDIT_CARD,
      value: mockedProduct.price,
      attempts: 1,
      gatewayTransactionId: mockedPaymentResponse.gatewayTransactionId,
      creditCardBrand: mockedPaymentResponse.creditCardBrand,
      installments: 1,
      installmentsValue: mockedProduct.price,
    });

    customersRepository.countCustomersByNameInPeriod = vi.fn().mockResolvedValue(0);
    customersRepository.countCustomersByDocumentInPeriod = vi.fn().mockResolvedValue(0);
    customersRepository.countCustomersByEmailInPeriod = vi.fn().mockResolvedValue(0);
    customersRepository.countCustomersByPhoneInPeriod = vi.fn().mockResolvedValue(0);
    customersRepository.findByDocument = vi.fn().mockResolvedValue(null);
    customersRepository.create = vi.fn().mockResolvedValue(mockedCustomer);
    productsRepository.findByUuid = vi.fn().mockResolvedValue(mockedProduct);
    salesRepository.create = vi.fn().mockResolvedValue(mockedSale);
    salesRepository.findByProductsAndCustomer = vi.fn().mockResolvedValue(null);

    paymentStrategyContext = {
      setStrategy: vi.fn(),
      processPayment: vi.fn().mockResolvedValue(mockedPaymentResponse),
    };

    queueManager = {
      register: vi.fn(),
      enqueue: vi.fn(),
      dequeue: vi.fn(),
    };
  });

  it("should successfully process a payment", async () => {
    const input: ProcessPaymentInput = {
      customer: {
        name: "Any Name",
        document: "01234567890",
        email: "any@email.com",
        phone: "1234567890",
      },
      products: [mockedProduct.uuid.toString()],
      paymentMethod: SaleConstants.PaymentMethod.CREDIT_CARD,
      installments: 1,
      creditCard: {
        name: "Any Name",
        number: "1111222233334444",
        expiration: "12/25",
        cvv: "123",
      },
    };

    const sut = new ProcessPaymentUseCase(
      customersRepository,
      productsRepository,
      salesRepository,
      paymentStrategyContext,
      queueManager,
    );

    const result = await sut.execute(input);

    expect(result.status).toBe("success");
    expect(result.uuid).toBeDefined();
  });
});
