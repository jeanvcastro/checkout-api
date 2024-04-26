import { DataTypes, Model, type Sequelize } from "sequelize";
import type Sale from "./Sale";

interface SaleProductAttributes {
  productId: number;
  saleId: number;
}

export class SaleProduct extends Model<SaleProductAttributes> implements SaleProductAttributes {
  declare productId: number;
  declare saleId: number;

  declare sales: Sale[];

  static initialize(sequelize: Sequelize): typeof SaleProduct {
    return SaleProduct.init(
      {
        productId: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: false,
          field: "product_id",
          references: {
            model: "products",
            key: "id",
          },
        },
        saleId: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: false,
          field: "sale_id",
          references: {
            model: "sales",
            key: "id",
          },
        },
      },
      {
        sequelize,
        modelName: "SaleProduct",
        tableName: "sale_products",
        timestamps: false,
      },
    );
  }
}

export default SaleProduct;
