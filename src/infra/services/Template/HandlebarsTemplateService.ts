import type TemplateService from "@/core/services/TemplateService";
import fs from "fs";
import Handlebars from "handlebars";
import path from "path";
import { TemplateNotFoundException } from "./errors/TemplateNotFoundException";

export default class HandlebarsTemplateService implements TemplateService {
  private readonly templatesPath: string;

  constructor() {
    this.templatesPath = path.resolve(__dirname, "../../templates/Handlebars");
    this.registerPartials();
  }

  private registerPartials() {
    const partialsPath = path.join(this.templatesPath, "partials");

    const partials = fs.readdirSync(partialsPath);

    partials.forEach((partial) => {
      const partialName = partial.split(".")[0];
      const partialPath = path.join(partialsPath, partial);

      const partialFile = fs.readFileSync(partialPath, "utf8");
      Handlebars.registerPartial(partialName, partialFile);
    });
  }

  render(template: string, data: Record<string, any>): string {
    const templateName = `${template}.hbs`;
    const templatePath = path.join(this.templatesPath, templateName);

    if (!fs.existsSync(templatePath)) {
      throw new TemplateNotFoundException(templateName);
    }

    const templateFile = fs.readFileSync(templatePath, "utf8");
    const templateCompiler = Handlebars.compile(templateFile);

    return templateCompiler(data);
  }
}
