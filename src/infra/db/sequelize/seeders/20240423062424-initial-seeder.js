"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "customers",
      [
        {
          uuid: "1e1b0b4c-6f6f-4e9c-8b7b-4e9c8b7b4e9c",
          name: "Initial Customer",
          document: "12345678900",
          email: "initial@customer.com",
          phone: "123456789",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {},
    );

    await queryInterface.bulkInsert(
      "products",
      [
        {
          uuid: "2e2b0b4c-6f6f-4e9c-8b7b-4e9c8b7b4e9c",
          name: "Initial Product",
          price: 10000,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {},
    );

    await queryInterface.bulkInsert(
      "sales",
      [
        {
          uuid: "3e2b0b4c-6f6f-4e9c-8b7b-4e9c8b7b4e9c",
          customer_id: 1,
          status: "APPROVED",
          payment_method: "CREDIT_CARD",
          value: 10000,
          attempts: 1,
          gateway_transaction_id: "123456",
          credit_card_brand: "visa",
          installments: 1,
          installments_value: 10000,
          digitable_line: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {},
    );

    await queryInterface.bulkInsert(
      "sale_products",
      [
        {
          sale_id: 1,
          product_id: 1,
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("sale_products", null, {});
    await queryInterface.bulkDelete("sales", null, {});
    await queryInterface.bulkDelete("products", null, {});
    await queryInterface.bulkDelete("customers", null, {});
  },
};
