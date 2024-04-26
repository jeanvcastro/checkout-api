import configureDI from "@/shared/di";
import "dotenv/config";
import SendNotificationJob from "../jobs/SendNotificationJob";

const container = configureDI();

const queueManager = container.get("QueueManager");

queueManager.register(SendNotificationJob.name, SendNotificationJob.processor);

queueManager.dequeue();

console.log(`[Queue]: worker is running`);
