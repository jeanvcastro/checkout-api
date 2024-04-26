export type Queue = "high" | "default" | "low";

export type Processor = (data: any) => Promise<void>;

export interface QueueManager {
  register: (jobName: string, processor: Processor) => void;
  enqueue: (jobName: string, data: any, queue?: Queue) => void;
  dequeue: () => void;
}
