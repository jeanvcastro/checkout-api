import fs from "fs";
import path from "path";
import { connection } from "../config";

const sequelize = connection;
let modelsInitialized = false;
const models: Record<string, any> = {};

function createModels() {
  if (!modelsInitialized) {
    fs.readdirSync(__dirname)
      .filter((file: string) => {
        return file.indexOf(".") !== 0 && file !== path.basename(__filename) && [".ts", ".js"].includes(file.slice(-3));
      })
      .forEach((file: string) => {
        const model = require(path.join(__dirname, file));
        models[model.default.name] = model.default.initialize(sequelize);
      });

    Object.keys(models).forEach((modelName) => {
      if (models[modelName].associate) {
        models[modelName].associate(models);
      }
    });

    modelsInitialized = true;
  }
}

export default createModels;
