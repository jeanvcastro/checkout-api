import { UUID } from "../valueObjects/UUID";

export interface BaseEntityProps {
  uuid?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class BaseEntity {
  uuid: UUID;
  createdAt: Date;
  updatedAt: Date;

  constructor(props?: BaseEntityProps) {
    this.uuid = new UUID(props?.uuid);
    this.createdAt = props?.createdAt ?? new Date();
    this.updatedAt = props?.updatedAt ?? new Date();
  }
}
