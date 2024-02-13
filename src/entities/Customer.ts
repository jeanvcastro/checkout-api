import { InvalidParameterException } from "../errors/InvalidParameterException";
import { CNPJ } from "../valueObjects/CNPJ";
import { CPF } from "../valueObjects/CPF";
import { BaseEntity, type BaseEntityProps } from "./BaseEntity";

export type CustomerProps = BaseEntityProps & {
  name: string;
  document: string;
  email: string;
  phone: string;
};

export class Customer extends BaseEntity {
  private _name: string;
  private declare _document: CPF | CNPJ;
  private _email: string;
  private _phone: string;

  constructor(props: CustomerProps) {
    super(props);
    this._name = props.name;
    this.document = props.document;
    this._email = props.email;
    this._phone = props.phone;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get document(): string {
    return this._document.value;
  }

  set document(value: string) {
    const cleanDocument = value.replace(/\D/g, "");
    if (cleanDocument.length === 11) {
      this._document = new CPF(cleanDocument);
    } else if (cleanDocument.length === 14) {
      this._document = new CNPJ(cleanDocument);
    } else {
      throw new InvalidParameterException("Document", value);
    }
  }

  get email(): string {
    return this._email;
  }

  set email(value: string) {
    this._email = value;
  }

  get phone(): string {
    return this._phone;
  }

  set phone(value: string) {
    this._phone = value;
  }
}
