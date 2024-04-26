export class TemplateNotFoundException extends Error {
  constructor(templateName: string) {
    super();
    this.message = `Template ${templateName} not found.`;
    this.name = "TemplateNotFoundException";
  }
}
