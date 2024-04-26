import { type Sequelize } from "sequelize";

export interface DatabaseCredentials {
  username: string;
  password: string;
  database: string;
  host: string;
  dialect: string;
}

export declare const databaseCredentials: Record<string, DatabaseCredentials>;
export declare const connection: Sequelize;
