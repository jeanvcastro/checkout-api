import { isDev } from "@/config";
import type Logger from "@/core/services/Logger";
import dayjs from "dayjs";
import path from "path";
import winston, { format, transports, type transport } from "winston";

export default class WinstonLogger implements Logger {
  winstonLogger: winston.Logger;

  constructor() {
    const logLevel = process.env.LOG_LEVEL ?? "debug";

    const consoleFormat = format.combine(
      format.colorize(),
      format.timestamp({
        format: "YYYY-DD-MM HH:mm:ss",
      }),
      format.printf(({ level, message, timestamp }) => {
        return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
      }),
    );

    const loggerTransports: transport[] = [
      new transports.Console({
        format: consoleFormat,
        level: logLevel,
      }),
    ];

    if (isDev) {
      const fileFormat = format.combine(
        format.timestamp({
          format: "YYYY-DD-MM HH:mm:ss",
        }),
        format.printf(({ level, message, timestamp }) => {
          return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        }),
      );
      loggerTransports.push(
        new transports.File({
          filename: path.resolve(`logs/checkout-${dayjs().format("DD-MM-YYYY")}.log`),
          format: fileFormat,
          level: logLevel,
        }),
      );
    }

    this.winstonLogger = winston.createLogger({
      level: logLevel,
      transports: loggerTransports,
    });
  }

  private winstonLogMap(data: unknown) {
    return data instanceof Error ? { message: data.message, stack: data.stack } : { message: data };
  }

  debug(logData: unknown) {
    this.winstonLogger.debug(this.winstonLogMap(logData));
  }

  info(logData: unknown) {
    this.winstonLogger.info(this.winstonLogMap(logData));
  }

  warn(logData: unknown) {
    this.winstonLogger.warn(this.winstonLogMap(logData));
  }

  error(logData: unknown) {
    this.winstonLogger.error(this.winstonLogMap(logData));
  }

  fatal(logData: unknown) {
    this.winstonLogger.error(this.winstonLogMap(logData));
  }
}
