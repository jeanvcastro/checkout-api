import { BaseController } from "@/core/BaseController";
import type Logger from "@/core/services/Logger";
import { type Request, type Response } from "express";
import { type ShowSaleUseCase } from "./ShowSaleUseCase";
import { ShowSaleInputValidator } from "./ShowSaleValidator";

export class ShowSaleController extends BaseController {
  constructor(
    private readonly useCase: ShowSaleUseCase,
    private readonly logger: Logger,
  ) {
    super();
  }

  async handle(request: Request, response: Response) {
    try {
      const uuid = request.params.uuid;
      const data = ShowSaleInputValidator.parse({ uuid });

      const result = await this.useCase.execute(data);

      return this.sendJson(response, result);
    } catch (e) {
      this.logger.error(e);
      return this.sendErrorJson(response, e);
    }
  }
}
