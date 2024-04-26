import { type PDFService } from "@/core/services/PDFService";
import { spawnSync } from "child_process";

export default class WeasyPrintPDFService implements PDFService {
  htmlToPDF(html: string) {
    const result = spawnSync("weasyprint", ["-", "-"], {
      input: html,
    });

    if (result.error ?? result.status !== 0) {
      throw new Error("Error generating PDF from HTML: " + JSON.stringify(result));
    }

    return Buffer.from(result.stdout);
  }
}
