import { Customer } from "@/core/domain/entities/Customer";
import { Sale } from "@/core/domain/entities/Sale";
import { EntityNotFoundException } from "@/core/domain/errors/EntityNotFoundException";
import { type SalesRepository } from "@/core/domain/repositories/SalesRepository";
import { type ShowSaleInput } from "./ShowSaleInput";
import { type ShowSaleOutput } from "./ShowSaleOutput";

export class ShowSaleUseCase {
  constructor(private readonly salesRepository: SalesRepository) {}

  async execute({ uuid }: ShowSaleInput): Promise<ShowSaleOutput> {
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

    return {
      uuid: sale.uuid.toString(),
      value: sale.value,
      status: sale.status,
      paymentMethod: sale.paymentMethod,
      creditCardBrand: sale.creditCardBrand,
      installments: sale.installments,
      installmentsValue: sale.installmentsValue,
      digitableLine: sale.digitableLine,
      barcode: sale.barcode,
      qrcode: sale.qrcode,
      expiration: sale.expiration,
      customer: customerData,
      products,
    };
  }
}
