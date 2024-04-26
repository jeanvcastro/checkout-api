import { Mapper } from "@/core/Mapper";
import { Product, type ProductProps } from "@/core/domain/entities/Product";

export class ProductMapper extends Mapper<Product> {
  public static toDomain(raw: any): Product {
    return new Product(raw as ProductProps);
  }

  public static toPersistence(entity: Product): ProductProps {
    const persistenceData = {
      id: entity.id,
      uuid: entity.uuid.toString(),
      name: entity.name,
      price: entity.price,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };

    return persistenceData;
  }
}
