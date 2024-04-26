import { Router } from "express";

const saleRouter = Router();

saleRouter.get("/:uuid", async (req, res) => {
  const controller = req.container.get("ShowSaleController");
  return await controller.handle(req, res);
});

saleRouter.get("/:uuid/bankslip", async (req, res) => {
  const controller = req.container.get("DownloadBankslipController");
  return await controller.handle(req, res);
});

export default saleRouter;
