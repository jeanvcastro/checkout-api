import { BaseController } from "@/core/BaseController";
import type Logger from "@/core/services/Logger";
import { type Request, type Response } from "express";
import { type DownloadBankslipUseCase } from "./DownloadBankslipUseCase";
import { DownloadBankslipInputValidator } from "./DownloadBankslipValidator";

export class DownloadBankslipController extends BaseController {
  constructor(
    private readonly useCase: DownloadBankslipUseCase,
    private readonly logger: Logger,
  ) {
    super();
  }

  async handle(request: Request, response: Response) {
    try {
      const uuid = request.params.uuid;
      const data = DownloadBankslipInputValidator.parse({ uuid });

      const result = await this.useCase.execute(data);

      this.logger.debug({ result });

      return this.sendJson(response, result);
    } catch (e) {
      this.logger.error(e);
      return this.sendErrorJson(response, e);
    }
  }
}
