import { AntiFraudRuleViolationException } from "@/app/errors/AntiFraudRuleViolationException";
import { InvalidInstallmentsException } from "@/app/errors/InvalidInstallmentsException";
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
import { RequiredParameterException } from "@/domain/errors/RequiredParameterException";
import { type PaymentRequest, type PaymentResponse, type PaymentStrategy } from "@/domain/services/PaymentStrategy";
import { InstallmentCalculator } from "@/domain/valueObjects/InstallmentCalculator";
import { type ProcessPaymentInput } from "./ProcessPaymentInput";
import { type ProcessPaymentOutput } from "./ProcessPaymentOutput";

interface Context {
  customer: Customer;
  products: Product[];
  sale: Sale;
  paymentRequest: PaymentRequest;
  paymentStrategy: PaymentStrategy;
  paymentResponse: PaymentResponse;
  input: ProcessPaymentInput;
}

export abstract class AbstractHandler {
  private nextHandler: AbstractHandler | null = null;

  public setNext(handler: AbstractHandler): AbstractHandler {
    this.nextHandler = handler;
    return handler;
  }

  public async handle(context: Context | Partial<Context>): Promise<void> {
    if (this.nextHandler) {
      await this.nextHandler.handle(context);
    }
  }
}

export class VerifyAntifraudRulesHandler extends AbstractHandler {
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

export class SetCustomerHandler extends AbstractHandler {
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

export class SetProductsHandler extends AbstractHandler {
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

export class SetPaymentStrategyHandler extends AbstractHandler {
  async handle(context: Context): Promise<void> {
    const { input } = context;
    const { paymentMethod } = input;

    switch (paymentMethod) {
      case SaleConstants.PaymentMethod.CREDIT_CARD:
        context.paymentStrategy = new CreditCardStrategy();
        break;
      case SaleConstants.PaymentMethod.BANK_SLIP:
        context.paymentStrategy = new BankSlipStrategy();
        break;
      case SaleConstants.PaymentMethod.PIX:
        context.paymentStrategy = new PixStrategy();
        break;
      default:
        throw new InvalidPaymentMethodException();
    }

    await super.handle(context);
  }
}

export class ProcessPaymentHandler extends AbstractHandler {
  async handle(context: Context): Promise<void> {
    const { input, customer, products, paymentStrategy } = context;
    const paymentRequestProducts = products.map((product) => ({
      id: product.uuid.toString(),
      name: product.name,
      price: product.price,
    }));

    const amount = products.reduce((acc, product) => acc + product.price, 0);

    const paymentRequest: PaymentRequest = {
      amount,
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

      paymentRequest.amount = selectedInstallment.value * selectedInstallment.number;
      paymentRequest.creditCard = input.creditCard;
      paymentRequest.installments = input.installments;
    }

    if (input.paymentMethod === SaleConstants.PaymentMethod.BANK_SLIP) {
      paymentRequest.expiration = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    }

    if (input.paymentMethod === SaleConstants.PaymentMethod.PIX) {
      paymentRequest.expiration = new Date(Date.now() + 15 * 60 * 1000);
    }

    context.paymentRequest = paymentRequest;
    context.paymentResponse = await paymentStrategy.processPayment(paymentRequest);

    await super.handle(context);
  }
}

export class SetSaleHandler extends AbstractHandler {
  constructor(private readonly salesRepository: SalesRepository) {
    super();
  }

  async handle(context: Context): Promise<void> {
    const { input, customer, products, paymentResponse } = context;
    const productsUuids = products.map((product) => product.uuid.toString());

    let sale = await this.salesRepository.findByProductsAndCustomer(productsUuids, customer.document);

    if (sale) {
      sale.attempts++;
      await this.salesRepository.update(sale);
    }

    if (!sale) {
      sale = new Sale({
        status: paymentResponse.status,
        paymentMethod: input.paymentMethod,
        value: context.paymentRequest.amount,
        attempts: 1,
        gatewayTransactionId: paymentResponse.gatewayTransactionId,
        creditCardBrand: paymentResponse.creditCardBrand,
        digitableLine: paymentResponse.digitableLine,
        barcode: paymentResponse.barcode,
        qrcode: paymentResponse.qrcode,
        expiration: paymentResponse.expiration,
      });

      await this.salesRepository.create(sale);
    }

    context.sale = sale;

    await super.handle(context);
  }
}

export class SendNotificationHandler extends AbstractHandler {
  async handle(context: Context): Promise<void> {
    await super.handle(context);
  }
}
export class ProcessPaymentUseCase {
  constructor(
    private readonly customersRepository: CustomersRepository,
    private readonly productsRepository: ProductsRepository,
    private readonly salesRepository: SalesRepository,
  ) {}

  async execute(input: ProcessPaymentInput): Promise<ProcessPaymentOutput> {
    const context: Partial<Context> = {
      input,
    };

    const verifyAntifraudRulesHandler = new VerifyAntifraudRulesHandler(this.customersRepository);
    const setCustomerHandler = new SetCustomerHandler(this.customersRepository);
    const setProductsHandler = new SetProductsHandler(this.productsRepository);
    const setPaymentStrategyHandler = new SetPaymentStrategyHandler();
    const processPaymentHandler = new ProcessPaymentHandler();
    const setSaleHandler = new SetSaleHandler(this.salesRepository);
    const sendNotificationHandler = new SendNotificationHandler();

    verifyAntifraudRulesHandler.setNext(setCustomerHandler);
    setCustomerHandler.setNext(setProductsHandler);
    setProductsHandler.setNext(setPaymentStrategyHandler);
    setPaymentStrategyHandler.setNext(processPaymentHandler);
    processPaymentHandler.setNext(setSaleHandler);
    setSaleHandler.setNext(sendNotificationHandler);

    await verifyAntifraudRulesHandler.handle(context);

    return {
      status: "success",
      saleUuid: (context as Context).sale.uuid.toString(),
    };
  }
}
