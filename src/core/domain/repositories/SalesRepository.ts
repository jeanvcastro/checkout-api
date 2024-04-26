import { type Sale } from "@/core/domain/entities/Sale";

export interface SalesRepository {
  find: (uuid: string) => Promise<Sale | null>;
  findByProductsAndCustomer: (productsIds: number[], customerId: number) => Promise<Sale | null>;
  update: (sale: Sale) => Promise<boolean>;
  create: (sale: Sale, productIds: number[]) => Promise<Sale>;
}
