import { type ProductProps } from "@/core/domain/entities/Product";
import { DataTypes, Model, type ModelStatic, type Sequelize } from "sequelize";
import type Sale from "./Sale";

type ProductAttributes = Required<ProductProps>;
type ProductCreationAttributes = ProductProps;

export class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  declare id: number;
  declare uuid: string;
  declare name: string;
  declare price: number;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;

  declare sales: Sale[];

  static initialize(sequelize: Sequelize): typeof Product {
    return Product.init(
      {
        id: {
          autoIncrement: true,
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: false,
          primaryKey: true,
        },
        uuid: {
          type: DataTypes.CHAR(36),
          allowNull: false,
          unique: true,
        },
        name: {
          type: DataTypes.STRING(150),
          allowNull: false,
        },
        price: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: "created_at",
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: "updated_at",
        },
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: "deleted_at",
        },
      },
      {
        sequelize,
        modelName: "Product",
        tableName: "products",
        timestamps: true,
        paranoid: true,
      },
    );
  }

  static associate(models: Record<string, ModelStatic<Model<any, any>>>) {
    Product.belongsToMany(models.Sale, {
      as: "sales",
      through: models.SaleProduct,
      foreignKey: "productId",
      otherKey: "saleId",
    });
  }
}

export default Product;
