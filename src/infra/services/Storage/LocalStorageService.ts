import type StorageService from "@/core/services/StorageService";
import { type FileProps } from "@/core/services/StorageService";
import fs from "fs";
import path from "path";

export const localStorageBasePath = path.join(__dirname, "..", "..", "storage");

export class LocalStorageService implements StorageService {
  async upload(file: FileProps): Promise<string> {
    const filePath = path.join(localStorageBasePath, file.name);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, file.data);
    return `${process.env.APP_URL}/storage/${file.name}`;
  }

  async get(fileName: string): Promise<string | null> {
    const filePath = path.join(localStorageBasePath, fileName);

    if (fs.existsSync(filePath)) {
      return `${process.env.APP_URL}/storage/${fileName}`;
    }

    return null;
  }
}
