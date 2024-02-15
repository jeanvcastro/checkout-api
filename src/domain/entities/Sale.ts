import { ExpirationRequiredException } from "@/domain/errors/ExpirationRequiredException";
import { TooManyPaymentAttemptsException } from "@/domain/errors/TooManyPaymentAttemptsException";
import { ValueNegativeException } from "@/domain/errors/ValueNegativeException";
import { ValueTooHighException } from "@/domain/errors/ValueTooHighException";
import { ValueTooLowException } from "@/domain/errors/ValueTooLowException";
import { BaseEntity, type BaseEntityProps } from "./BaseEntity";
import { Customer, type CustomerProps } from "./Customer";
import { Product, type ProductProps } from "./Product";

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
  status: SaleConstants.Status;
  paymentMethod: SaleConstants.PaymentMethod;
  value: number;
  attempts: number;
  gatewayTransactionId: string | null;
  creditCardBrand?: string | null;
  digitableLine?: string | null;
  barcode?: string | null;
  qrcode?: string | null;
  expiration?: Date | null;
  customer?: CustomerProps | null;
  products?: ProductProps[];
};

export class Sale extends BaseEntity {
  private _status: SaleConstants.Status;
  private _paymentMethod: SaleConstants.PaymentMethod;
  private declare _value: number;
  private declare _attempts: number;
  private _gatewayTransactionId: string | null;
  private _creditCardBrand: string | null;
  private _digitableLine: string | null;
  private _barcode: string | null;
  private _qrcode: string | null;
  private declare _expiration: Date | null;
  private _customer: Customer | null;
  private _products: Product[];

  constructor(props: SaleProps) {
    super(props);
    this._status = props.status;
    this._paymentMethod = props.paymentMethod;
    this.value = props.value;
    this.attempts = props.attempts;
    this._gatewayTransactionId = props.gatewayTransactionId ?? null;
    this._creditCardBrand = props.creditCardBrand ?? null;
    this._digitableLine = props.digitableLine ?? null;
    this._barcode = props.barcode ?? null;
    this._qrcode = props.qrcode ?? null;
    this.expiration = props.expiration ?? null;
    this._customer = props.customer ? new Customer(props.customer) : null;
    this._products = props.products?.map((product) => new Product(product)) ?? [];
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

  get gatewayTransactionId(): string | null {
    return this._gatewayTransactionId;
  }

  set gatewayTransactionId(value: string | null) {
    this._gatewayTransactionId = value;
  }

  get creditCardBrand(): string | null {
    return this._creditCardBrand;
  }

  set creditCardBrand(value: string | null) {
    this._creditCardBrand = value;
  }

  get digitableLine(): string | null {
    return this._digitableLine;
  }

  set digitableLine(value: string | null) {
    this._digitableLine = value;
  }

  get barcode(): string | null {
    return this._barcode;
  }

  set barcode(value: string | null) {
    this._barcode = value;
  }

  get qrcode(): string | null {
    return this._qrcode;
  }

  set qrcode(value: string | null) {
    this._qrcode = value;
  }

  get expiration(): Date | null {
    return this._expiration;
  }

  set expiration(value: Date | null) {
    if (this._paymentMethod !== SaleConstants.PaymentMethod.CREDIT_CARD && !value) {
      throw new ExpirationRequiredException();
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
