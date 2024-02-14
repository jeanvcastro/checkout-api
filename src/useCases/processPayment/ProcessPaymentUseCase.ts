import { type CustomersRepository } from "@/domain/data/repositories/CustomersRepository";
import { type ProductsRepository } from "@/domain/data/repositories/ProductsRepository";
import { Customer } from "@/domain/entities/Customer";
import { type Product } from "@/domain/entities/Product";
import { AntiFraudRuleViolationException } from "@/errors/AntiFraudRuleViolationException";
import { type ProcessPaymentInput } from "./ProcessPaymentInput";
import { type ProcessPaymentOutput } from "./ProcessPaymentOutput";

export class ProcessPaymentUseCase {
  private declare customer: Customer;
  private declare products: Product[];

  constructor(
    private readonly customersRepository: CustomersRepository,
    private readonly productsRepository: ProductsRepository,
  ) {}

  private setCustomer(input: ProcessPaymentInput): void {
    const { name, document, email, phone } = input.customer;

    this.customer = new Customer({
      name,
      document,
      email,
      phone,
    });
  }

  private async verifyAntifraudRules(input: ProcessPaymentInput): Promise<void> {
    const { name, document, email, phone } = input.customer;

    const nameCount = await this.customersRepository.countCustomersByNameInPeriod(name, 24);
    if (nameCount > 5) {
      throw new AntiFraudRuleViolationException();
    }

    const documentCount = await this.customersRepository.countCustomersByDocumentInPeriod(document, 24);
    if (documentCount > 5) {
      throw new AntiFraudRuleViolationException();
    }

    const emailCount = await this.customersRepository.countCustomersByEmailInPeriod(email, 24);
    if (emailCount > 5) {
      throw new AntiFraudRuleViolationException();
    }

    const phoneCount = await this.customersRepository.countCustomersByPhoneInPeriod(phone, 24);
    if (phoneCount > 5) {
      throw new AntiFraudRuleViolationException();
    }
  }

  private async setProducts(input: ProcessPaymentInput): Promise<void> {
    const productsPromises = input.products.map(
      async (productUuid) => await this.productsRepository.findByUuid(productUuid),
    );
    this.products = await Promise.all(productsPromises);
  }

  async execute(input: ProcessPaymentInput): Promise<ProcessPaymentOutput> {
    this.setCustomer(input);
    await this.verifyAntifraudRules(input);
    await this.setProducts(input);

    return {
      status: "failure",
      message: "Not implemented",
    };
  }
}
