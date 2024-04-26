import { randomUUID } from "node:crypto";
import { InvalidParameterException } from "../errors/InvalidParameterException";

export class UUID {
  value: string;

  constructor(value?: string) {
    if (value && !this.validateUUID(value)) {
      throw new InvalidParameterException("UUID", value);
    }
    this.value = value ?? randomUUID();
  }

  validateUUID(uuid: string): boolean {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
  }

  toString(): string {
    return this.value;
  }
}
