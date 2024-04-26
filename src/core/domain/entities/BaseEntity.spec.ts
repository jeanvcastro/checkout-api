import { describe, expect, it } from "vitest";
import { UUID } from "../valueObjects/UUID";
import { BaseEntity } from "./BaseEntity";

describe("BaseEntity", () => {
  it("should create an instance with default values", () => {
    const entity = new BaseEntity();
    expect(entity.uuid).toBeInstanceOf(UUID);
    expect(entity.createdAt).toBeInstanceOf(Date);
    expect(entity.updatedAt).toBeInstanceOf(Date);
  });

  it("should create an instance with provided values", () => {
    const uuid = new UUID();
    const createdAt = new Date("2020-01-01");
    const updatedAt = new Date("2020-01-02");

    const entity = new BaseEntity();
    entity.fillProps({
      uuid: uuid.toString(),
      createdAt,
      updatedAt,
    });

    expect(entity.uuid.toString()).toBe(uuid.toString());
    expect(entity.createdAt).toEqual(createdAt);
    expect(entity.updatedAt).toEqual(updatedAt);
  });
});
