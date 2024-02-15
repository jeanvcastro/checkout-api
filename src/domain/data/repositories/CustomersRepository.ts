import { type Customer } from "@/domain/entities/Customer";

export interface CustomersRepository {
  countCustomersByNameInPeriod: (name: string, periodInHours: number) => Promise<number>;
  countCustomersByDocumentInPeriod: (document: string, periodInHours: number) => Promise<number>;
  countCustomersByEmailInPeriod: (email: string, periodInHours: number) => Promise<number>;
  countCustomersByPhoneInPeriod: (phone: string, periodInHours: number) => Promise<number>;
  findByDocument: (document: string) => Promise<Customer | null>;
  update: (customer: Customer) => Promise<void>;
  create: (customer: Customer) => Promise<void>;
}
