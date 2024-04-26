import { z } from "zod";

export const ShowSaleInputValidator = z.object({
  uuid: z.string().length(36).uuid(),
});
