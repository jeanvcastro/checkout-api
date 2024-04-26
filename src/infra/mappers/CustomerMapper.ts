import { Mapper } from "@/core/Mapper";
import { Customer, type CustomerProps } from "@/core/domain/entities/Customer";

export class CustomerMapper extends Mapper<Customer> {
  public static toDomain(raw: any): Customer {
    return new Customer(raw as CustomerProps);
  }

  public static toPersistence(entity: Customer): CustomerProps {
    const persistenceData = {
      id: entity.id,
      uuid: entity.uuid.toString(),
      name: entity.name,
      document: entity.document,
      email: entity.email,
      phone: entity.phone,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };

    return persistenceData;
  }
}
