import { type Sale } from "@/core/domain/entities/Sale";
import { type SalesRepository } from "@/core/domain/repositories/SalesRepository";
import { Op } from "sequelize";
import CustomerModel from "../db/sequelize/models/Customer";
import ProductModel from "../db/sequelize/models/Product";
import SaleModel from "../db/sequelize/models/Sale";
import SaleProductModel from "../db/sequelize/models/SaleProduct";
import { SaleMapper } from "../mappers/SaleMapper";

export class SequelizeSalesRepository implements SalesRepository {
  async find(uuid: string) {
    const sale = await SaleModel.findOne({
      where: {
        uuid,
      },
      include: [
        {
          model: ProductModel,
          as: "products",
        },
        {
          model: CustomerModel,
          as: "customer",
        },
      ],
    });

    if (!sale) {
      return null;
    }

    return SaleMapper.toDomain(sale.toJSON());
  }

  async findByProductsAndCustomer(productIds: number[], customerId: number) {
    const sale = await SaleModel.findOne({
      where: {
        customerId,
      },
      include: [
        {
          model: ProductModel,
          as: "products",
          where: {
            id: {
              [Op.in]: productIds,
            },
          },
        },
      ],
    });

    if (!sale) {
      return null;
    }

    return SaleMapper.toDomain(sale.toJSON());
  }

  async update(sale: Sale) {
    const data = SaleMapper.toPersistence(sale);

    const [rows] = await SaleModel.update(data, {
      where: {
        uuid: sale.uuid.toString(),
      },
    });

    return rows > 0;
  }

  async create(sale: Sale, productIds: number[]) {
    const data = SaleMapper.toPersistence(sale);
    const createdSale = await SaleModel.create(data);

    for (const productId of productIds) {
      await SaleProductModel.create({
        saleId: createdSale.id,
        productId,
      });
    }

    return SaleMapper.toDomain(createdSale.toJSON());
  }
}
