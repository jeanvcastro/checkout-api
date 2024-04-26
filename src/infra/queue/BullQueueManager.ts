import { type Processor, type Queue, type QueueManager } from "@/core/QueueManager";
import type Logger from "@/core/services/Logger";
import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api/bullAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { Queue as BullmqQueue, Worker, type Job as BullmqJob } from "bullmq";
import { type Router } from "express";
import { JobProcessorNotFoundException } from "./errors/JobProcessorNotFoundException";

const connection = {
  host: process.env.REDIS_HOST ?? "127.0.0.1",
  port: Number(process.env.REDIS_PORT) ?? 6379,
  db: 1,
};

const queues = {
  high: new BullmqQueue("high", {
    connection,
    defaultJobOptions: {
      priority: 1,
      attempts: 3,
    },
  }),
  default: new BullmqQueue("default", {
    connection,
    defaultJobOptions: {
      priority: 2,
      attempts: 3,
    },
  }),
  low: new BullmqQueue("low", {
    connection,
    defaultJobOptions: {
      priority: 3,
      attempts: 3,
    },
  }),
};

export default class BullQueueManager implements QueueManager {
  private readonly queues: Record<Queue, BullmqQueue>;
  private readonly workers: Record<Queue, Worker>;
  private readonly processors: Record<string, (data: any) => Promise<void>> = {};

  constructor(private readonly logger: Logger) {
    this.queues = queues;

    const processor = async (bullmqJob: BullmqJob) => {
      try {
        const { name, data } = bullmqJob;
        const handler = this.processors[name];

        if (!handler) {
          throw new JobProcessorNotFoundException(name);
        }

        await handler(data);
      } catch (error) {
        this.logger.error(error);
      }
    };

    this.workers = {
      high: new Worker("high", processor, {
        connection,
        autorun: false,
        concurrency: 10,
        limiter: { max: 1, duration: 1000 },
      }),
      default: new Worker("default", processor, {
        connection,
        autorun: false,
        concurrency: 10,
        limiter: { max: 1, duration: 1000 },
      }),
      low: new Worker("low", processor, {
        connection,
        autorun: false,
        concurrency: 10,
        limiter: { max: 1, duration: 1000 },
      }),
    };
  }

  register(jobName: string, processor: Processor) {
    this.processors[jobName] = processor;
  }

  async enqueue(jobName: string, jobData: any, queue: Queue = "default") {
    return await this.queues[queue].add(jobName, jobData);
  }

  dequeue() {
    Object.values(this.workers).forEach(async (worker) => await worker.run());
  }
}

const bullBoardUrl = `/queues/${process.env.BULL_ACCESS_KEY}`;
const expressAdapter = new ExpressAdapter();
expressAdapter.setBasePath(bullBoardUrl);
createBullBoard({
  queues: Object.values(queues).map((queue) => new BullAdapter(queue)),
  serverAdapter: expressAdapter,
});
const bullBoardRouter = expressAdapter.getRouter() as Router;

export { bullBoardRouter, bullBoardUrl };
