import { type Product } from "@/domain/entities/Product";

export interface ProductsRepository {
  findByUuid: (uuid: string) => Promise<Product>;
}
