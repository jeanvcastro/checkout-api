import { type Customer } from "@/core/domain/entities/Customer";
import { type CustomersRepository } from "@/core/domain/repositories/CustomersRepository";
import dayjs from "dayjs";
import { Op } from "sequelize";
import CustomerModel from "../db/sequelize/models/Customer";
import { CustomerMapper } from "../mappers/CustomerMapper";

export class SequelizeCustomersRepository implements CustomersRepository {
  async countCustomersByNameInPeriod(name: string, periodInHours: number) {
    const count = await CustomerModel.count({
      where: {
        name,
        createdAt: {
          [Op.gte]: dayjs().subtract(periodInHours, "hours").toDate(),
        },
      },
    });

    return count;
  }

  async countCustomersByDocumentInPeriod(document: string, periodInHours: number) {
    const count = await CustomerModel.count({
      where: {
        document,
        createdAt: {
          [Op.gte]: dayjs().subtract(periodInHours, "hours").toDate(),
        },
      },
    });

    return count;
  }

  async countCustomersByEmailInPeriod(email: string, periodInHours: number) {
    const count = await CustomerModel.count({
      where: {
        email,
        createdAt: {
          [Op.gte]: dayjs().subtract(periodInHours, "hours").toDate(),
        },
      },
    });

    return count;
  }

  async countCustomersByPhoneInPeriod(phone: string, periodInHours: number) {
    const count = await CustomerModel.count({
      where: {
        phone,
        createdAt: {
          [Op.gte]: dayjs().subtract(periodInHours, "hours").toDate(),
        },
      },
    });

    return count;
  }

  async findByDocument(document: string) {
    const customer = await CustomerModel.findOne({
      where: {
        document,
      },
    });

    if (!customer) {
      return null;
    }

    return CustomerMapper.toDomain(customer.toJSON());
  }

  async update(customer: Customer) {
    const data = CustomerMapper.toPersistence(customer);

    const [rows] = await CustomerModel.update(data, {
      where: {
        uuid: customer.uuid.toString(),
      },
    });

    return rows > 0;
  }

  async create(customer: Customer) {
    const data = CustomerMapper.toPersistence(customer);
    const createdCustomer = await CustomerModel.create(data);

    return CustomerMapper.toDomain(createdCustomer.toJSON());
  }
}
