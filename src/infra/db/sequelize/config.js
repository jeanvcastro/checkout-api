require("dotenv").config();
const Sequelize = require("sequelize");

const DB_USER = process.env.DB_USER ?? "";
const DB_PASS = process.env.DB_PASS ?? "";
const DB_NAME = process.env.DB_NAME ?? "";
const DB_HOST = process.env.DB_HOST ?? "";
const environment = process.env.NODE_ENV ?? "development";

const databaseCredentials = {
  development: {
    username: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    host: DB_HOST,
    dialect: "mysql",
  },
  test: {
    username: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    host: DB_HOST,
    dialect: "mysql",
  },
  production: {
    username: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    host: DB_HOST,
    dialect: "mysql",
  },
};

const { username, password, database, host, dialect } = databaseCredentials[environment];

if (typeof database !== "string" || typeof username !== "string" || typeof password !== "string") {
  throw new Error("Invalid database credentials");
}

const connection = new Sequelize(database, username, password, {
  host,
  dialect,
  port: 3306,
  timezone: "-03:00",
  logging: false,
});

module.exports = databaseCredentials;
module.exports.connection = connection;
