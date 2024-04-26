import { RequiredParameterException } from "@/core/domain/errors/RequiredParameterException";
import { TooManyPaymentAttemptsException } from "@/core/domain/errors/TooManyPaymentAttemptsException";
import { ValueNegativeException } from "@/core/domain/errors/ValueNegativeException";
import { ValueTooHighException } from "@/core/domain/errors/ValueTooHighException";
import { ValueTooLowException } from "@/core/domain/errors/ValueTooLowException";
import { BaseEntity, type BaseEntityProps } from "./BaseEntity";
import { type Customer } from "./Customer";
import { type Product } from "./Product";

export namespace SaleConstants {
  export enum Status {
    INITIATED = "INITIATED",
    APPROVED = "APPROVED",
    PENDING = "PENDING",
    REFUSED = "REFUSED",
  }

  export enum PaymentMethod {
    CREDIT_CARD = "CREDIT_CARD",
    PIX = "PIX",
    BANK_SLIP = "BANK_SLIP",
  }
}

export type SaleProps = BaseEntityProps & {
  customerId: number;
  status: SaleConstants.Status;
  paymentMethod: SaleConstants.PaymentMethod;
  value: number;
  attempts: number;
  gatewayTransactionId: string;
  creditCardBrand?: string | null;
  installments?: number | null;
  installmentsValue?: number | null;
  digitableLine?: string | null;
  barcode?: string | null;
  qrcode?: string | null;
  expiration?: Date | null;
  customer?: Customer | null;
  products?: Product[];
};

export class Sale extends BaseEntity {
  private _customerId: number = 0;
  private _status: SaleConstants.Status = SaleConstants.Status.INITIATED;
  private _paymentMethod: SaleConstants.PaymentMethod = SaleConstants.PaymentMethod.CREDIT_CARD;
  private _value: number = 0;
  private _attempts: number = 0;
  private _gatewayTransactionId: string = "";
  private _creditCardBrand: string | null = null;
  private _installments: number | null = null;
  private _installmentsValue: number | null = null;
  private _digitableLine: string | null = null;
  private _barcode: string | null = null;
  private _qrcode: string | null = null;
  private _expiration: Date | null = null;
  private _customer: Customer | null = null;
  private _products: Product[] = [];

  constructor(props: SaleProps) {
    super();
    this.fillProps(props);
  }

  public get customerId(): number {
    return this._customerId;
  }

  public set customerId(value: number) {
    this._customerId = value;
  }

  get status(): SaleConstants.Status {
    return this._status;
  }

  set status(value: SaleConstants.Status) {
    this._status = value;
  }

  get paymentMethod(): SaleConstants.PaymentMethod {
    return this._paymentMethod;
  }

  set paymentMethod(value: SaleConstants.PaymentMethod) {
    this._paymentMethod = value;
  }

  get value(): number {
    return this._value;
  }

  set value(value: number) {
    if (value < 0) throw new ValueNegativeException();
    if (value < 500) throw new ValueTooLowException();
    if (value > 500000) throw new ValueTooHighException();
    this._value = value;
  }

  get attempts(): number {
    return this._attempts;
  }

  set attempts(value: number) {
    if (value > 5) throw new TooManyPaymentAttemptsException();
    this._attempts = value;
  }

  get gatewayTransactionId(): string {
    return this._gatewayTransactionId;
  }

  set gatewayTransactionId(value: string) {
    this._gatewayTransactionId = value;
  }

  get creditCardBrand(): string | null {
    return this._creditCardBrand;
  }

  set creditCardBrand(value: string | null) {
    if (this._paymentMethod === SaleConstants.PaymentMethod.CREDIT_CARD && !value) {
      throw new RequiredParameterException("CreditCardBrand");
    }

    this._creditCardBrand = value;
  }

  get installments(): number | null {
    return this._installments;
  }

  set installments(value: number | null) {
    if (this._paymentMethod === SaleConstants.PaymentMethod.CREDIT_CARD && !value) {
      throw new RequiredParameterException("Installments");
    }

    this._installments = value;
  }

  get installmentsValue(): number | null {
    return this._installmentsValue;
  }

  set installmentsValue(value: number | null) {
    if (this._paymentMethod === SaleConstants.PaymentMethod.CREDIT_CARD && !value) {
      throw new RequiredParameterException("InstallmentsValue");
    }

    this._installmentsValue = value;
  }

  get digitableLine(): string | null {
    return this._digitableLine;
  }

  set digitableLine(value: string | null) {
    if (this._paymentMethod === SaleConstants.PaymentMethod.BANK_SLIP && !value) {
      throw new RequiredParameterException("DigitableLine");
    }

    this._digitableLine = value;
  }

  get barcode(): string | null {
    return this._barcode;
  }

  set barcode(value: string | null) {
    if (this._paymentMethod === SaleConstants.PaymentMethod.BANK_SLIP && !value) {
      throw new RequiredParameterException("Barcode");
    }

    this._barcode = value;
  }

  get qrcode(): string | null {
    return this._qrcode;
  }

  set qrcode(value: string | null) {
    if (this._paymentMethod === SaleConstants.PaymentMethod.PIX && !value) {
      throw new RequiredParameterException("QRCode");
    }

    this._qrcode = value;
  }

  get expiration(): Date | null {
    return this._expiration;
  }

  set expiration(value: Date | null) {
    if (
      this._paymentMethod !== SaleConstants.PaymentMethod.CREDIT_CARD &&
      this.status !== SaleConstants.Status.REFUSED &&
      !value
    ) {
      throw new RequiredParameterException("Expiration");
    }

    this._expiration = value;
  }

  get customer(): Customer | null {
    return this._customer;
  }

  set customer(value: Customer | null) {
    this._customer = value;
  }

  get products(): Product[] {
    return this._products;
  }

  set products(value: Product[]) {
    this._products = value;
  }
}
