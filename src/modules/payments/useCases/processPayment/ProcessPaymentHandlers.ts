import { type QueueManager } from "@/core/QueueManager";
import { Customer } from "@/core/domain/entities/Customer";
import { Sale, SaleConstants } from "@/core/domain/entities/Sale";
import { RequiredParameterException } from "@/core/domain/errors/RequiredParameterException";
import { type CustomersRepository } from "@/core/domain/repositories/CustomersRepository";
import { type ProductsRepository } from "@/core/domain/repositories/ProductsRepository";
import { type SalesRepository } from "@/core/domain/repositories/SalesRepository";
import { InstallmentCalculator } from "@/core/domain/valueObjects/InstallmentCalculator";
import { PaymentHandler, type Context } from "@/core/services/Payment/PaymentHandler";
import { type PaymentRequest, type PaymentStrategyContext } from "@/core/services/Payment/PaymentStrategy";
import SendNotificationJob from "@/infra/jobs/SendNotificationJob";
import { AntiFraudRuleViolationException } from "@/modules/payments/errors/AntiFraudRuleViolationException";
import { InvalidInstallmentsException } from "@/modules/payments/errors/InvalidInstallmentsException";

export class VerifyAntifraudRulesHandler extends PaymentHandler {
  constructor(private readonly customersRepository: CustomersRepository) {
    super();
  }

  async handle(context: Partial<Context>): Promise<void> {
    const { input } = context;

    if (!input) {
      throw new RequiredParameterException("input");
    }

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

    await super.handle(context);
  }
}

export class SetCustomerHandler extends PaymentHandler {
  constructor(private readonly customersRepository: CustomersRepository) {
    super();
  }

  async handle(context: Context): Promise<void> {
    const { input } = context;
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
      await this.customersRepository.create(customer);
    }

    context.customer = customer;

    await super.handle(context);
  }
}

export class SetProductsHandler extends PaymentHandler {
  constructor(private readonly productsRepository: ProductsRepository) {
    super();
  }

  async handle(context: Context): Promise<void> {
    const { input } = context;
    const productsPromises = input.products.map(
      async (productUuid) => await this.productsRepository.findByUuid(productUuid),
    );
    context.products = await Promise.all(productsPromises);

    await super.handle(context);
  }
}

export class ProcessPaymentHandler extends PaymentHandler {
  constructor(private readonly paymentStrategyContext: PaymentStrategyContext) {
    super();
  }

  async handle(context: Context): Promise<void> {
    const { input, customer, products } = context;
    const paymentRequestProducts = products.map((product) => ({
      id: product.uuid.toString(),
      name: product.name,
      price: product.price,
    }));

    const amount = products.reduce((acc, product) => acc + product.price, 0);

    const paymentRequest: PaymentRequest = {
      amount,
      paymentMethod: input.paymentMethod,
      products: paymentRequestProducts,
      customer: {
        name: customer.name,
        email: customer.email,
        document: customer.document,
        phone: customer.phone,
      },
    };

    if (input.paymentMethod === SaleConstants.PaymentMethod.CREDIT_CARD) {
      if (!input.installments) {
        throw new RequiredParameterException("Installments");
      }
      if (!input.creditCard) {
        throw new RequiredParameterException("CreditCard");
      }

      const availableInstallments = new InstallmentCalculator(amount, input.installments).result;
      const selectedInstallment = availableInstallments.find(
        (installment) => installment.number === input.installments,
      );

      if (!selectedInstallment) {
        throw new InvalidInstallmentsException();
      }

      paymentRequest.creditCard = input.creditCard;
      paymentRequest.installments = input.installments;
      paymentRequest.amount = selectedInstallment.value * selectedInstallment.number;

      context.installment = selectedInstallment;
    }

    if (input.paymentMethod === SaleConstants.PaymentMethod.BANK_SLIP) {
      paymentRequest.expiration = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    }

    if (input.paymentMethod === SaleConstants.PaymentMethod.PIX) {
      paymentRequest.expiration = new Date(Date.now() + 15 * 60 * 1000);
    }

    context.paymentRequest = paymentRequest;
    context.paymentResponse = await this.paymentStrategyContext.processPayment(paymentRequest);

    await super.handle(context);
  }
}

export class SetSaleHandler extends PaymentHandler {
  constructor(private readonly salesRepository: SalesRepository) {
    super();
  }

  async handle(context: Context): Promise<void> {
    const { input, customer, products, paymentResponse } = context;
    const productsIds = products.map((product) => product.id);

    let sale = await this.salesRepository.findByProductsAndCustomer(productsIds, customer.id);

    if (sale) {
      sale.attempts++;
      await this.salesRepository.update(sale);
    }

    if (!sale) {
      sale = new Sale({
        customerId: 1,
        status: paymentResponse.status,
        paymentMethod: input.paymentMethod,
        value: context.paymentRequest.amount,
        attempts: 1,
        gatewayTransactionId: paymentResponse.gatewayTransactionId,
        creditCardBrand: paymentResponse.creditCardBrand,
        installments: context.installment?.number,
        installmentsValue: context.installment?.value,
        digitableLine: paymentResponse.digitableLine,
        barcode: paymentResponse.barcode,
        qrcode: paymentResponse.qrcode,
        expiration: paymentResponse.expiration,
      });

      sale = await this.salesRepository.create(sale, productsIds);
    }

    context.sale = sale;

    await super.handle(context);
  }
}

export class SendNotificationHandler extends PaymentHandler {
  constructor(private readonly queueManager: QueueManager) {
    super();
  }

  async handle(context: Context): Promise<void> {
    this.queueManager.enqueue(SendNotificationJob.name, {
      name: context.customer.name,
      email: context.customer.email,
    });

    await super.handle(context);
  }
}
