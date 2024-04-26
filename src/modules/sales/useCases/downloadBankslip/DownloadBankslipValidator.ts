import { z } from "zod";

export const DownloadBankslipInputValidator = z.object({
  uuid: z.string().length(36).uuid(),
});
