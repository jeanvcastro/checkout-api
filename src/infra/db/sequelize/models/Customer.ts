import { type CustomerProps } from "@/core/domain/entities/Customer";
import { DataTypes, Model, type ModelStatic, type Sequelize } from "sequelize";
import type Sale from "./Sale";

type CustomerAttributes = Required<CustomerProps>;
type CustomerCreationAttributes = CustomerProps;

export class Customer extends Model<CustomerAttributes, CustomerCreationAttributes> implements CustomerAttributes {
  declare id: number;
  declare uuid: string;
  declare name: string;
  declare document: string;
  declare email: string;
  declare phone: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;

  declare sales: Sale[];

  static initialize(sequelize: Sequelize): typeof Customer {
    return Customer.init(
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
        email: {
          type: DataTypes.STRING(60),
          allowNull: false,
        },
        phone: {
          type: DataTypes.STRING(20),
          allowNull: false,
        },
        document: {
          type: DataTypes.STRING(20),
          allowNull: false,
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
        modelName: "Customer",
        tableName: "customers",
        timestamps: true,
        paranoid: true,
      },
    );
  }

  static associate(models: Record<string, ModelStatic<Model<any, any>>>) {
    Customer.hasMany(models.Sale, { as: "sales", foreignKey: "customer_id" });
  }
}

export default Customer;
