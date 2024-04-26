import { Customer } from "@/core/domain/entities/Customer";
import { Product } from "@/core/domain/entities/Product";
import { Sale, SaleConstants } from "@/core/domain/entities/Sale";
import { EntityNotFoundException } from "@/core/domain/errors/EntityNotFoundException";
import { type SalesRepository } from "@/core/domain/repositories/SalesRepository";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ShowSaleUseCase } from "./ShowSaleUseCase";

describe("ShowSaleUseCase", () => {
  const salesRepository = vi.mocked<Partial<SalesRepository>>({}) as SalesRepository;

  let mockedProduct: Product;
  let mockedCustomer: Customer;
  let mockedSale: Sale;

  beforeEach(() => {
    mockedProduct = new Product({
      name: "any_name",
      price: 500,
    });

    mockedCustomer = new Customer({
      id: 1,
      name: "Any Name",
      document: "01234567890",
      email: "any@email",
      phone: "any_phone",
    });

    mockedSale = new Sale({
      customerId: mockedCustomer.id,
      status: SaleConstants.Status.APPROVED,
      paymentMethod: SaleConstants.PaymentMethod.CREDIT_CARD,
      value: mockedProduct.price,
      attempts: 1,
      gatewayTransactionId: "any_transaction_id",
      creditCardBrand: "visa",
      installments: 1,
      installmentsValue: mockedProduct.price,
    });

    mockedSale.customer = mockedCustomer;
    mockedSale.products = [mockedProduct];

    salesRepository.find = vi.fn().mockResolvedValue(mockedSale);
  });

  it("should return detailed sale information when sale is found", async () => {
    const sut = new ShowSaleUseCase(salesRepository);

    const result = await sut.execute({ uuid: mockedSale.uuid.toString() });

    expect(result).toEqual({
      uuid: mockedSale.uuid.toString(),
      value: mockedSale.value,
      status: mockedSale.status,
      paymentMethod: mockedSale.paymentMethod,
      creditCardBrand: mockedSale.creditCardBrand,
      installments: mockedSale.installments,
      installmentsValue: mockedSale.installmentsValue,
      customer: {
        name: mockedCustomer.name,
        email: mockedCustomer.email,
      },
      products: [
        {
          name: mockedProduct.name,
          price: mockedProduct.price,
        },
      ],
    });
  });

  it("should throw EntityNotFoundException when sale is not found", async () => {
    salesRepository.find = vi.fn().mockResolvedValue(null);

    const sut = new ShowSaleUseCase(salesRepository);

    const uuid = mockedSale.uuid.toString();

    await expect(sut.execute({ uuid })).rejects.toThrow(new EntityNotFoundException("Sale", uuid));
  });

  it("should throw EntityNotFoundException when customer is not found", async () => {
    mockedSale.customer = null;
    salesRepository.find = vi.fn().mockResolvedValue(mockedSale);

    const sut = new ShowSaleUseCase(salesRepository);
    const uuid = mockedSale.uuid.toString();

    await expect(sut.execute({ uuid })).rejects.toThrow(
      new EntityNotFoundException("Customer", `sale with uuid ${uuid}`),
    );
  });
});
