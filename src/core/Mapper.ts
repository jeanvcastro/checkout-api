import { type BaseEntity } from "./domain/entities/BaseEntity";

export abstract class Mapper<T extends BaseEntity> {
  constructor(private readonly entity: T) {}
}
