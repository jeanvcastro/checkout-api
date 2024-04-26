import { type Product } from "@/core/domain/entities/Product";

export interface ProductsRepository {
  findByUuid: (uuid: string) => Promise<Product>;
}
