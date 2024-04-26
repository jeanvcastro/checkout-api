"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("customers", {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      uuid: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      document: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(60),
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: "created_at",
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: "updated_at",
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "deleted_at",
      },
    });

    await queryInterface.createTable("products", {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      uuid: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      price: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: "created_at",
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: "updated_at",
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "deleted_at",
      },
    });

    await queryInterface.createTable("sales", {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      uuid: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        unique: true,
      },
      customerId: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        field: "customer_id",
        references: {
          model: "customers",
          key: "id",
        },
      },
      status: {
        type: Sequelize.ENUM("APPROVED", "PENDING", "REFUSED"),
        allowNull: false,
        defaultValue: "PENDING",
      },
      paymentMethod: {
        type: Sequelize.ENUM("CREDIT_CARD", "PIX", "BANK_SLIP"),
        allowNull: false,
        field: "payment_method",
      },
      value: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      attempts: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
      },
      gatewayTransactionId: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: "gateway_transaction_id",
      },
      creditCardBrand: {
        type: Sequelize.STRING(20),
        allowNull: true,
        field: "credit_card_brand",
      },
      installments: {
        type: Sequelize.TINYINT,
        allowNull: true,
      },
      installmentsValue: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        field: "installments_value",
      },
      digitableLine: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: "digitable_line",
      },
      barcode: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      qrcode: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      expiration: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: "created_at",
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: "updated_at",
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "deleted_at",
      },
    });

    await queryInterface.createTable("sale_products", {
      productId: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        field: "product_id",
        references: {
          model: "products",
          key: "id",
        },
      },
      saleId: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        field: "sale_id",
        references: {
          model: "sales",
          key: "id",
        },
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("sale_products");
    await queryInterface.dropTable("sales");
    await queryInterface.dropTable("products");
    await queryInterface.dropTable("customers");
  },
};
