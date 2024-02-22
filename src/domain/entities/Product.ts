import { ValueNegativeException } from "../errors/ValueNegativeException";
import { ValueTooHighException } from "../errors/ValueTooHighException";
import { ValueTooLowException } from "../errors/ValueTooLowException";
import { BaseEntity, type BaseEntityProps } from "./BaseEntity";

export type ProductProps = BaseEntityProps & {
  name: string;
  price: number;
};

export class Product extends BaseEntity {
  private _name: string = "";
  private _price: number = 0;

  constructor(props: ProductProps) {
    super();
    this.fillProps(props);
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get price(): number {
    return this._price;
  }

  set price(value: number) {
    if (value < 0) throw new ValueNegativeException();
    if (value < 500) throw new ValueTooLowException();
    if (value > 500000) throw new ValueTooHighException();
    this._price = value;
  }
}
