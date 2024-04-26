import { isProduction } from "@/config";
import { type Response } from "express";
import { objectToSnake, toSnake } from "ts-case-convert";
import { ZodError } from "zod";

export abstract class BaseController {
  public sendJson<T>(response: Response, data: T, code: number = 200): Response {
    if (typeof data === "string") {
      return response.status(code).json({ message: data });
    }

    if (typeof data === "object") {
      return response.status(code).json(objectToSnake(data as object));
    }

    return response.status(code).json(data);
  }

  public sendErrorJson(response: Response, error: unknown, code: number = 400): Response {
    if (error instanceof ZodError) {
      const errors = error.issues.reduce((prev: object, issue) => {
        const path = issue.path.join(".");
        return {
          [toSnake(path)]: issue.message,
          ...prev,
        };
      }, {});

      return response.status(422).json({ message: "Parâmetros inválidos", errors });
    }

    if (error instanceof Error && !isProduction) {
      return response.status(code).json({ message: error.message });
    }

    if (typeof error === "object" && !isProduction) {
      return response.status(code).json(error);
    }

    if (typeof error === "string" && !isProduction) {
      return response.status(code).json({ message: error });
    }

    return response.status(code).json({ message: "Erro inesperado" });
  }
}
