import paymentRouter from "@/modules/payments/routes";
import saleRouter from "@/modules/sales/routes";
import { Router } from "express";

const v1Router = Router();

v1Router.use("/payment", paymentRouter);
v1Router.use("/order", saleRouter);

export default v1Router;
