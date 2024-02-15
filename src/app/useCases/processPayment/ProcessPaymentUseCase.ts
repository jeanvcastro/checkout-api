import { AntiFraudRuleViolationException } from "@/app/errors/AntiFraudRuleViolationException";
import { InvalidPaymentMethodException } from "@/app/errors/InvalidPaymentMethodException";
import { BankSlipStrategy } from "@/app/services/payments/BankSlipStrategy";
import { CreditCardStrategy } from "@/app/services/payments/CreditCardStrategy";
import { PixStrategy } from "@/app/services/payments/PixStrategy";
import { type CustomersRepository } from "@/domain/data/repositories/CustomersRepository";
import { type ProductsRepository } from "@/domain/data/repositories/ProductsRepository";
import { type SalesRepository } from "@/domain/data/repositories/SalesRepository";
import { Customer } from "@/domain/entities/Customer";
import { type Product } from "@/domain/entities/Product";
import { Sale, SaleConstants } from "@/domain/entities/Sale";
import { type PaymentRequest, type PaymentResponse, type PaymentStrategy } from "@/domain/services/PaymentStrategy";
import { type ProcessPaymentInput } from "./ProcessPaymentInput";
import { type ProcessPaymentOutput } from "./ProcessPaymentOutput";

export class ProcessPaymentUseCase {
  private declare customer: Customer;
  private declare products: Product[];
  private declare sale: Sale;
  private declare readonly paymentRequest: PaymentRequest;
  private declare paymentStrategy: PaymentStrategy;
  private declare paymentResponse: PaymentResponse;

  constructor(
    private readonly customersRepository: CustomersRepository,
    private readonly productsRepository: ProductsRepository,
    private readonly salesRepository: SalesRepository,
  ) {}

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

  private async setCustomer(input: ProcessPaymentInput): Promise<void> {
    const { name, document, email, phone } = input.customer;

    let customer = await this.customersRepository.findByDocument(document);

    if (customer) {
      customer.name = name;
      customer.email = email;
      customer.phone = phone;
      await this.customersRepository.update(customer);
    }

    if (!customer) {
      customer = new Customer({
        name,
        document,
        email,
        phone,
      });
      await this.customersRepository.create(this.customer);
    }

    this.customer = customer;
  }

  private async setProducts(input: ProcessPaymentInput): Promise<void> {
    const productsPromises = input.products.map(
      async (productUuid) => await this.productsRepository.findByUuid(productUuid),
    );
    this.products = await Promise.all(productsPromises);
  }

  private setPaymentStrategy(input: ProcessPaymentInput): void {
    const { paymentMethod } = input;

    switch (paymentMethod) {
      case SaleConstants.PaymentMethod.CREDIT_CARD:
        this.paymentStrategy = new CreditCardStrategy();
        break;
      case SaleConstants.PaymentMethod.BANK_SLIP:
        this.paymentStrategy = new BankSlipStrategy();
        break;
      case SaleConstants.PaymentMethod.PIX:
        this.paymentStrategy = new PixStrategy();
        break;
      default:
        throw new InvalidPaymentMethodException();
    }
  }

  private async processPayment(input: ProcessPaymentInput): Promise<void> {
    const amount = this.products.reduce((acc, product) => acc + product.price, 0);
    const products = this.products.map((product) => ({
      id: product.uuid.toString(),
      name: product.name,
      price: product.price,
    }));

    const paymentRequest: PaymentRequest = {
      amount,
      products,
      customer: {
        name: this.customer.name,
        email: this.customer.email,
        document: this.customer.document,
        phone: this.customer.phone,
      },
    };

    if (input.paymentMethod === SaleConstants.PaymentMethod.CREDIT_CARD) {
      paymentRequest.creditCard = input.creditCard;
      paymentRequest.installments = input.installments;
    }

    if (input.paymentMethod === SaleConstants.PaymentMethod.BANK_SLIP) {
      paymentRequest.expiration = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    }

    if (input.paymentMethod === SaleConstants.PaymentMethod.PIX) {
      paymentRequest.expiration = new Date(Date.now() + 15 * 60 * 1000);
    }

    this.paymentResponse = await this.paymentStrategy.processPayment(paymentRequest);
  }

  async setSale(input: ProcessPaymentInput): Promise<void> {
    const productsUuids = this.products.map((product) => product.uuid.toString());

    let sale = await this.salesRepository.findByProductsAndCustomer(productsUuids, this.customer.document);

    if (sale) {
      sale.attempts++;
      await this.salesRepository.update(sale);
    }

    if (!sale) {
      sale = new Sale({
        status: this.paymentResponse.status,
        paymentMethod: input.paymentMethod,
        value: this.paymentRequest.amount,
        attempts: 1,
        installments: input.installments,
        gatewayTransactionId: this.paymentResponse.gatewayTransactionId,
        creditCardBrand: this.paymentResponse.creditCardBrand,
        digitableLine: this.paymentResponse.digitableLine,
        barcode: this.paymentResponse.barcode,
        qrcode: this.paymentResponse.qrcode,
        expiration: this.paymentResponse.expiration,
      });

      await this.salesRepository.create(sale);
    }

    this.sale = sale;
  }

  async sendNotification(): Promise<void> {
    // TODO: Send notification to customer
  }

  async execute(input: ProcessPaymentInput): Promise<ProcessPaymentOutput> {
    try {
      await this.verifyAntifraudRules(input);
      await this.setCustomer(input);
      await this.setProducts(input);
      this.setPaymentStrategy(input);
      await this.processPayment(input);
      await this.setSale(input);
      await this.sendNotification();

      return {
        status: "success",
        saleUuid: this.sale.uuid.toString(),
      };
    } catch (error: any) {
      return {
        status: "failure",
        message: error?.message ?? "Internal server error",
      };
    }
  }
}
