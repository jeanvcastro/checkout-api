import { type CustomersRepository } from "@/domain/data/repositories/CustomersRepository";
import { type ProductsRepository } from "@/domain/data/repositories/ProductsRepository";
import { type SalesRepository } from "@/domain/data/repositories/SalesRepository";
import { Product } from "@/domain/entities/Product";
import { SaleConstants } from "@/domain/entities/Sale";
import { type PaymentResponse } from "@/domain/services/PaymentStrategy";
import { UUID } from "@/domain/valueObjects/UUID";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type ProcessPaymentInput } from "./ProcessPaymentInput";
import { type PaymentStrategyContext } from "./ProcessPaymentStrategyContext";
import { ProcessPaymentUseCase } from "./ProcessPaymentUseCase";

describe("ProcessPaymentUseCase", () => {
  const customersRepository = vi.mocked<Partial<CustomersRepository>>({}) as CustomersRepository;
  const productsRepository = vi.mocked<Partial<ProductsRepository>>({}) as ProductsRepository;
  const salesRepository = vi.mocked<Partial<SalesRepository>>({}) as SalesRepository;

  let mockedPaymentResponse: PaymentResponse;
  let paymentStrategyContext: PaymentStrategyContext;

  let mockedProduct: Product;

  beforeEach(() => {
    mockedProduct = new Product({
      uuid: new UUID().toString(),
      name: "any_name",
      price: 500,
    });

    customersRepository.countCustomersByNameInPeriod = vi.fn().mockResolvedValue(0);
    customersRepository.countCustomersByDocumentInPeriod = vi.fn().mockResolvedValue(0);
    customersRepository.countCustomersByEmailInPeriod = vi.fn().mockResolvedValue(0);
    customersRepository.countCustomersByPhoneInPeriod = vi.fn().mockResolvedValue(0);
    customersRepository.findByDocument = vi.fn().mockResolvedValue(null);
    customersRepository.create = vi.fn().mockResolvedValue(() => {});
    productsRepository.findByUuid = vi.fn().mockResolvedValue(mockedProduct);
    salesRepository.create = vi.fn().mockResolvedValue(() => {});
    salesRepository.findByProductsAndCustomer = vi.fn().mockResolvedValue(null);

    mockedPaymentResponse = {
      status: SaleConstants.Status.APPROVED,
      gatewayTransactionId: "any_transaction_id",
      creditCardBrand: "any_brand",
      digitableLine: null,
      barcode: null,
      qrcode: null,
      expiration: null,
    };

    paymentStrategyContext = {
      setStrategy: vi.fn(),
      processPayment: vi.fn().mockResolvedValue(mockedPaymentResponse),
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
    );

    const result = await sut.execute(input);

    expect(result.status).toBe("success");
    expect(result.saleUuid).toBeDefined();
  });
});
