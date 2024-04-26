import { type AppDIContainer } from "@/shared/di";

declare global {
  namespace Express {
    export interface Request {
      container: AppDIContainer;
    }
  }
}
