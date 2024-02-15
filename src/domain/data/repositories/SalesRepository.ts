import { type Sale } from "@/domain/entities/Sale";

export interface SalesRepository {
  findByProductsAndCustomer: (productUuids: string[], customerUuid: string) => Promise<Sale | null>;
  update: (sale: Sale) => Promise<void>;
  create: (sale: Sale) => Promise<void>;
}
