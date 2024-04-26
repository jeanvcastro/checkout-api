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
  private _name: string = "";
  private _document: string = "";
  private _email: string = "";
  private _phone: string = "";

  constructor(props: CustomerProps) {
    super();
    this.fillProps(props);
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    const trimmedName = value.trim();

    if (/[^a-zA-Z\s]/.test(trimmedName)) {
      throw new InvalidParameterException("Name", value);
    }

    this._name = trimmedName;
  }

  get document(): string {
    return this._document;
  }

  set document(value: string) {
    const cleanDocument = value.replace(/\D/g, "");
    if (cleanDocument.length === 11) {
      this._document = new CPF(cleanDocument).value;
    } else if (cleanDocument.length === 14) {
      this._document = new CNPJ(cleanDocument).value;
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
