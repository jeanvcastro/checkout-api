import { UUID } from "../valueObjects/UUID";

export interface BaseEntityProps {
  [key: string | number | symbol]: any;
  uuid?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class BaseEntity {
  [key: string | number | symbol]: any;
  private _uuid: UUID = new UUID();
  private _createdAt: Date = new Date();
  private _updatedAt: Date = new Date();

  constructor(props?: BaseEntityProps) {
    if (props) {
      this.fillProps(props);
    }
  }

  fillProps(props: BaseEntityProps): void {
    const prototype = Object.getPrototypeOf(this);
    const descriptors = Object.getOwnPropertyDescriptors(prototype);

    Object.keys(descriptors).forEach((key) => {
      const descriptor = descriptors[key];
      if (descriptor && typeof descriptor.set !== "undefined") {
        const prop = key as keyof BaseEntityProps;
        this[prop] = props[prop];
      }
    });
  }

  public get uuid(): UUID {
    return this._uuid;
  }

  public set uuid(value: string) {
    this._uuid = new UUID(value);
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public set createdAt(value: Date) {
    this._createdAt = value;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public set updatedAt(value: Date) {
    this._updatedAt = value;
  }
}
