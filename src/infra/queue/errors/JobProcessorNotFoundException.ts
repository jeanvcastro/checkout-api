export class JobProcessorNotFoundException extends Error {
  constructor(jobName: string) {
    super();
    this.message = `Processor for job ${jobName} not found. You must register a processor for this job.`;
    this.name = "JobProcessorNotFoundException";
  }
}
