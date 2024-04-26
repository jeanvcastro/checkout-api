export interface FileProps {
  name: string;
  size: number;
  type: string;
  data: Buffer;
}

export default interface StorageService {
  upload: (file: FileProps) => Promise<string>;
  get: (fileName: string) => Promise<string | null>;
}
