import type StorageService from "@/core/services/StorageService";
import { type FileProps } from "@/core/services/StorageService";
import { GetObjectCommand, PutObjectCommand, S3 } from "@aws-sdk/client-s3";

export class S3StorageService implements StorageService {
  private readonly basePath = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com`;
  private readonly s3: S3;

  constructor() {
    this.s3 = new S3({
      apiVersion: "2006-03-01",
      region: process.env.AWS_S3_REGION,
      credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY ?? "",
      },
    });
  }

  async upload(file: FileProps): Promise<string> {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: file.name,
      Body: file.data,
      ContentType: file.type,
    };

    const command = new PutObjectCommand(params);
    await this.s3.send(command);

    return `${this.basePath}/${file.name}`;
  }

  async get(fileName: string): Promise<string | null> {
    try {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileName,
      };
      const command = new GetObjectCommand(params);
      await this.s3.send(command);

      return `${this.basePath}/${fileName}`;
    } catch (e) {
      return null;
    }
  }
}
