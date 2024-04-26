import { isProduction, port } from "@/config";
import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import createModels from "../db/sequelize/models";
import { bullBoardRouter, bullBoardUrl } from "../queue/BullQueueManager";
import { localStorageBasePath } from "../services/Storage/LocalStorageService";
import v1Router from "./api/v1";
import { camelCase } from "./middleware/camelCase";
import { diContainer } from "./middleware/diContainer";

createModels();

const app = express();

const origin = {
  origin: isProduction ? "https://api.devbroder.com" : "*",
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(origin));
app.use(compression());
app.use(helmet());
app.use(camelCase);
app.use(diContainer);

app.use("/storage", express.static(localStorageBasePath));

app.use(bullBoardUrl, bullBoardRouter);

app.use("/api/v1", v1Router);

app.listen(port, () => {
  console.log(`[App]: Server listening on ${port}`);
});

export { app };
