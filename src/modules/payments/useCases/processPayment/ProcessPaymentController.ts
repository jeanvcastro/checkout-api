import { BaseController } from "@/core/BaseController";
import type Logger from "@/core/services/Logger";
import { type Request, type Response } from "express";
import { type ProcessPaymentUseCase } from "./ProcessPaymentUseCase";
import { ProcessPaymentValidator } from "./ProcessPaymentValidator";

export class ProcessPaymentController extends BaseController {
  constructor(
    private readonly useCase: ProcessPaymentUseCase,
    private readonly logger: Logger,
  ) {
    super();
  }

  async handle(request: Request, response: Response) {
    try {
      const data = ProcessPaymentValidator.parse(request.body);

      const result = await this.useCase.execute(data);

      if (result.status === "failure") {
        return this.sendJson(response, result, 400);
      }

      return this.sendJson(response, result);
    } catch (e) {
      this.logger.error(e);
      return this.sendErrorJson(response, e);
    }
  }
}
