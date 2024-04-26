export interface PDFService {
  htmlToPDF: (html: string) => Buffer;
}
