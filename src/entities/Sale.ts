import { ExpirationRequiredException } from "@/errors/ExpirationRequiredException";
import { TooManyPaymentAttemptsException } from "@/errors/TooManyPaymentAttemptsException";
import { ValueNegativeException } from "@/errors/ValueNegativeException";
import { ValueTooHighException } from "@/errors/ValueTooHighException";
import { ValueTooLowException } from "@/errors/ValueTooLowException";
import { BaseEntity, type BaseEntityProps } from "./BaseEntity";
import { type Customer } from "./Customer";
import { type Product } from "./Product";

export namespace SaleConstants {
  export enum Status {
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
  expiration?: Date;
  customer: Customer;
  products: Product[];
};

export class Sale extends BaseEntity {
  private _status: SaleConstants.Status;
  private _paymentMethod: SaleConstants.PaymentMethod;
  private declare _value: number;
  private declare _attempts: number;
  private declare _expiration: Date | null;
  private _customer: Customer;
  private _products: Product[];

  constructor(props: SaleProps) {
    super(props);
    this._status = props.status;
    this._paymentMethod = props.paymentMethod;
    this.value = props.value;
    this.attempts = props.attempts;
    this.expiration = props.expiration ?? null;
    this._customer = props.customer;
    this._products = props.products;
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

  get attempts(): number | undefined {
    return this._attempts;
  }

  set attempts(value: number) {
    if (value > 5) throw new TooManyPaymentAttemptsException();
    this._attempts = value;
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

  get customer(): Customer {
    return this._customer;
  }

  set customer(value: Customer) {
    this._customer = value;
  }

  get products(): Product[] {
    return this._products;
  }

  set products(value: Product[]) {
    this._products = value;
  }
}
