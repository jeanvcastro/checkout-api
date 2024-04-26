import { Customer } from "@/core/domain/entities/Customer";
import { Product } from "@/core/domain/entities/Product";
import { Sale, SaleConstants } from "@/core/domain/entities/Sale";
import { EntityNotFoundException } from "@/core/domain/errors/EntityNotFoundException";
import { type SalesRepository } from "@/core/domain/repositories/SalesRepository";
import { type PDFService } from "@/core/services/PDFService";
import type StorageService from "@/core/services/StorageService";
import type TemplateService from "@/core/services/TemplateService";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DownloadBankslipUseCase } from "./DownloadBankslipUseCase";

describe("DownloadBankslipUseCase", () => {
  const salesRepository = vi.mocked<Partial<SalesRepository>>({}) as SalesRepository;
  const pdfService = vi.mocked<Partial<PDFService>>({}) as PDFService;
  const storageService = vi.mocked<Partial<StorageService>>({}) as StorageService;
  const templateService = vi.mocked<Partial<TemplateService>>({}) as TemplateService;

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
      status: SaleConstants.Status.PENDING,
      paymentMethod: SaleConstants.PaymentMethod.BANK_SLIP,
      value: mockedProduct.price,
      attempts: 1,
      gatewayTransactionId: "any_transaction_id",
      digitableLine: "any_digitable_line",
      barcode: "any_barcode",
      expiration: new Date("2022-12-31"),
    });

    mockedSale.customer = mockedCustomer;
    mockedSale.products = [mockedProduct];

    salesRepository.find = vi.fn().mockResolvedValue(mockedSale);

    storageService.get = vi.fn().mockResolvedValue(null);
    templateService.render = vi.fn().mockReturnValue("<html></html>");
    pdfService.htmlToPDF = vi.fn().mockReturnValue(new Uint8Array());
    storageService.upload = vi.fn().mockResolvedValue("http://example.com/bankslip.pdf");
  });

  it("should generate a PDF for an existing sale and return URL", async () => {
    const sut = new DownloadBankslipUseCase(salesRepository, storageService, templateService, pdfService);
    const uuid = mockedSale.uuid.toString();

    const result = await sut.execute({ uuid });

    expect(result).toEqual({
      uuid,
      value: mockedSale.value,
      digitableLine: mockedSale.digitableLine,
      barcode: mockedSale.barcode,
      expiration: mockedSale.expiration,
      url: "http://example.com/bankslip.pdf",
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

    const sut = new DownloadBankslipUseCase(salesRepository, storageService, templateService, pdfService);
    const uuid = mockedSale.uuid.toString();

    await expect(sut.execute({ uuid })).rejects.toThrow(new EntityNotFoundException("Sale", uuid));
  });

  it("should throw EntityNotFoundException when customer is not found", async () => {
    mockedSale.customer = null;
    salesRepository.find = vi.fn().mockResolvedValue(mockedSale);

    const sut = new DownloadBankslipUseCase(salesRepository, storageService, templateService, pdfService);
    const uuid = mockedSale.uuid.toString();

    await expect(sut.execute({ uuid })).rejects.toThrow(
      new EntityNotFoundException("Customer", `sale with uuid ${uuid}`),
    );
  });
});
