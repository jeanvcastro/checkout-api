import { type Customer } from "@/core/domain/entities/Customer";
import { type Product } from "@/core/domain/entities/Product";
import { type SaleConstants, type SaleProps } from "@/core/domain/entities/Sale";
import { DataTypes, Model, type ModelStatic, type Sequelize } from "sequelize";

type SaleAttributes = Required<Omit<SaleProps, "products" | "customer">>;
type SaleCreationAttributes = SaleProps;

export class Sale extends Model<SaleAttributes, SaleCreationAttributes> implements SaleAttributes {
  declare id: number;
  declare uuid: string;
  declare customerId: number;
  declare status: SaleConstants.Status;
  declare paymentMethod: SaleConstants.PaymentMethod;
  declare value: number;
  declare attempts: number;
  declare gatewayTransactionId: string;
  declare creditCardBrand: string | null;
  declare installments: number;
  declare installmentsValue: number;
  declare digitableLine: string | null;
  declare barcode: string | null;
  declare qrcode: string | null;
  declare expiration: Date | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;

  declare customer: Customer;
  declare products: Product[];

  static initialize(sequelize: Sequelize): typeof Sale {
    return Sale.init(
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
        customerId: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: false,
          references: {
            model: "customers",
            key: "id",
          },
          field: "customer_id",
        },
        status: {
          type: DataTypes.ENUM("APPROVED", "PENDING", "REFUSED"),
          allowNull: false,
          defaultValue: "INITIATED",
        },
        paymentMethod: {
          type: DataTypes.ENUM("CREDIT_CARD", "PIX", "BANK_SLIP"),
          allowNull: false,
          field: "payment_method",
        },
        attempts: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 1,
        },
        value: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
        },
        gatewayTransactionId: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: "gateway_transaction_id",
        },
        creditCardBrand: {
          type: DataTypes.STRING(20),
          allowNull: true,
          field: "credit_card_brand",
        },
        installments: {
          type: DataTypes.TINYINT,
          allowNull: true,
        },
        installmentsValue: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
          field: "installments_value",
        },
        digitableLine: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: "digitable_line",
        },
        barcode: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        qrcode: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        expiration: {
          type: DataTypes.DATE,
          allowNull: true,
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
        modelName: "Sale",
        tableName: "sales",
        timestamps: true,
        paranoid: true,
      },
    );
  }

  static associate(models: Record<string, ModelStatic<Model<any, any>>>) {
    Sale.belongsToMany(models.Product, {
      as: "products",
      through: models.SaleProduct,
      foreignKey: "saleId",
      otherKey: "productId",
    });
    Sale.belongsTo(models.Customer, { as: "customer", foreignKey: "customer_id" });
  }
}

export default Sale;
