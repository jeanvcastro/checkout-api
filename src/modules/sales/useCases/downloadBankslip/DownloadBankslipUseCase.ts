import { Customer } from "@/core/domain/entities/Customer";
import { Sale } from "@/core/domain/entities/Sale";
import { EntityNotFoundException } from "@/core/domain/errors/EntityNotFoundException";
import { type SalesRepository } from "@/core/domain/repositories/SalesRepository";
import { type PDFService } from "@/core/services/PDFService";
import type StorageService from "@/core/services/StorageService";
import type TemplateService from "@/core/services/TemplateService";
import { type DownloadBankslipInput } from "./DownloadBankslipInput";
import { type DownloadBankslipOutput } from "./DownloadBankslipOutput";

export class DownloadBankslipUseCase {
  constructor(
    private readonly salesRepository: SalesRepository,
    private readonly storageService: StorageService,
    private readonly templateService: TemplateService,
    private readonly pdfService: PDFService,
  ) {}

  async execute({ uuid }: DownloadBankslipInput): Promise<DownloadBankslipOutput> {
    const sale = await this.salesRepository.find(uuid);

    if (!sale) {
      throw new EntityNotFoundException(Sale.name, uuid);
    }

    const customer = sale.customer;

    if (!customer) {
      throw new EntityNotFoundException(Customer.name, `sale with uuid ${uuid}`);
    }

    const customerData = {
      name: customer.name,
      email: customer.email,
    };

    const products = sale.products.map((product) => ({
      name: product.name,
      price: product.price,
    }));

    const filename = `bankslips/bankslip-${sale.uuid.toString()}.pdf`;

    let url = await this.storageService.get(filename);

    if (!url) {
      const template = this.templateService.render("Bankslip", {
        uuid: sale.uuid.toString(),
        value: sale.value,
        digitableLine: sale.digitableLine,
        barcode: sale.barcode,
        expiration: sale.expiration,
        customer: customerData,
        products,
      });
      const pdf = this.pdfService.htmlToPDF(template);

      url = await this.storageService.upload({
        name: filename,
        size: pdf.length,
        type: "application/pdf",
        data: pdf,
      });
    }

    return {
      uuid: sale.uuid.toString(),
      value: sale.value,
      url,
      digitableLine: sale.digitableLine,
      barcode: sale.barcode,
      expiration: sale.expiration,
      customer: customerData,
      products,
    };
  }
}
