import { type Processor } from "./QueueManager";

export interface Job {
  name: string;
  processor: Processor;
}
