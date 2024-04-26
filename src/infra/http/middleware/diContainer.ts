import configureDI from "@/shared/di";
import { type NextFunction, type Request, type Response } from "express";

export function diContainer(req: Request, res: Response, next: NextFunction) {
  req.container = configureDI();
  next();
}
