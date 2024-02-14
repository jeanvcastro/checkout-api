import { randomUUID } from "crypto";
import { describe, expect, it } from "vitest";
import { InvalidParameterException } from "../errors/InvalidParameterException";
import { UUID } from "./UUID";

describe("UUID", () => {
  it("should generate a valid UUID if no value is provided", () => {
    const uuid = new UUID();
    expect(uuid.validateUUID(uuid.toString())).toBe(true);
  });

  it("should accept a valid UUID value", () => {
    const validUUID = randomUUID();
    const uuid = new UUID(validUUID);
    expect(uuid.toString()).toBe(validUUID);
  });

  it("should throw an error for an invalid UUID value", () => {
    const invalidUUID = "invalid-uuid";
    expect(() => new UUID(invalidUUID)).toThrow(InvalidParameterException);
  });
});
