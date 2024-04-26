import { Router } from "express";

const paymentRouter = Router();

paymentRouter.post("/", async (req, res) => {
  const controller = req.container.get("ProcessPaymentController");
  return await controller.handle(req, res);
});

export default paymentRouter;
