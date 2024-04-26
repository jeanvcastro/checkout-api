/* eslint-disable no-new */
import { SaleConstants } from "@/core/domain/entities/Sale";
import { CNPJ } from "@/core/domain/valueObjects/CNPJ";
import { CPF } from "@/core/domain/valueObjects/CPF";
import { z } from "zod";

export const ProcessPaymentValidator = z
  .object({
    products: z.array(z.string().length(36).uuid()),
    paymentMethod: z.nativeEnum(SaleConstants.PaymentMethod),
    customer: z.object({
      name: z.string().trim().min(2),
      email: z.string().trim().min(5).email(),
      document: z.string().min(11),
      phone: z.string().min(10),
    }),
    installments: z.number().optional(),
    creditCard: z
      .object({
        name: z.string().trim().min(2),
        number: z.string().min(16),
        expiration: z.string().min(5),
        cvv: z.string().min(3),
      })
      .optional(),
  })
  .superRefine(({ customer, paymentMethod, creditCard }, context) => {
    if (customer) {
      try {
        const cleanDocument = customer.document.replace(/\D/g, "");
        if (cleanDocument.length === 11) {
          new CPF(cleanDocument);
        } else if (cleanDocument.length === 14) {
          new CNPJ(cleanDocument);
        }
      } catch (_) {
        context.addIssue({
          path: ["document"],
          code: z.ZodIssueCode.custom,
          message: "Invalid document",
        });
      }
    }

    if (paymentMethod === SaleConstants.PaymentMethod.CREDIT_CARD && !creditCard) {
      context.addIssue({
        path: ["creditCard"],
        code: z.ZodIssueCode.custom,
        message: "Cartão de crédito inválido",
      });
    }
  });
