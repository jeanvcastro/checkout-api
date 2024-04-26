import { type NextFunction, type Request, type Response } from "express";
import { objectToCamel } from "ts-case-convert";

export async function camelCase(req: Request, res: Response, next: NextFunction) {
  req.body = objectToCamel(req.body);
  next();
}
