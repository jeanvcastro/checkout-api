import { EntityNotFoundException } from "@/core/domain/errors/EntityNotFoundException";
import { type ProductsRepository } from "@/core/domain/repositories/ProductsRepository";
import ProductModel from "../db/sequelize/models/Product";
import { ProductMapper } from "../mappers/ProductMapper";

export class SequelizeProductsRepository implements ProductsRepository {
  async findByUuid(uuid: string) {
    const product = await ProductModel.findOne({
      where: {
        uuid,
      },
    });

    if (!product) {
      throw new EntityNotFoundException("Product", uuid);
    }

    return ProductMapper.toDomain(product.toJSON());
  }
}
