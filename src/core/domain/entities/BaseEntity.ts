import { UUID } from "../valueObjects/UUID";

export interface BaseEntityProps {
  id?: number;
  uuid?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

type GenericProps = BaseEntityProps & Record<string | number | symbol, any>;

export class BaseEntity {
  [key: string | number | symbol]: any;
  private _id: number = 0;
  private _uuid: UUID = new UUID();
  private _createdAt: Date = new Date();
  private _updatedAt: Date = new Date();
  private _deletedAt: Date | null = null;

  fillProps(props: GenericProps): void {
    const prototype = Object.getPrototypeOf(this);
    const descriptors = Object.getOwnPropertyDescriptors(prototype);

    Object.keys(descriptors).forEach((key) => {
      const descriptor = descriptors[key];
      if (descriptor && typeof descriptor.set !== "undefined") {
        descriptor.set.call(this, props[key]);
      } else {
        this[key] = props[key];
      }
    });

    if (props.id) this.id = props.id;
    if (props.uuid) this.uuid = props.uuid;
    if (props.createdAt) this.createdAt = props.createdAt;
    if (props.updatedAt) this.updatedAt = props.updatedAt;
    if (props.deletedAt) this.deletedAt = props.deletedAt;
  }

  public get id(): number {
    return this._id;
  }

  public set id(value: number) {
    this._id = value;
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

  public get deletedAt(): Date | null {
    return this._deletedAt;
  }

  public set deletedAt(value: Date | null) {
    this._deletedAt = value;
  }
}
