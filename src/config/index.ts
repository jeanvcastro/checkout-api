import "dotenv/config";

export const isProduction = process.env.APP_ENV === "production" || process.env.NODE_ENV === "production";
export const isDev = process.env.APP_ENV === "development" || process.env.NODE_ENV === "development";

export const port = process.env.APP_PORT ?? 3333;
