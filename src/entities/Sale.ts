import { ExpirationRequiredException } from "@/errors/ExpirationRequiredException";
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
  expiration?: Date;
  customer: Customer;
  products: Product[];
};

export class Sale extends BaseEntity {
  private declare _status: SaleConstants.Status;
  private declare _paymentMethod: SaleConstants.PaymentMethod;
  private declare _value: number;
  private declare _expiration?: Date;
  private _customer: Customer;
  private _products: Product[];

  constructor(props: SaleProps) {
    super(props);
    this.status = props.status;
    this.paymentMethod = props.paymentMethod;
    this.value = props.value;
    this.expiration = props.expiration;
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

  get expiration(): Date | undefined {
    return this._expiration;
  }

  set expiration(value: Date | undefined) {
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
