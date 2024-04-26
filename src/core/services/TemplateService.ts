export default interface TemplateService {
  render: (template: string, data: Record<string, any>) => string;
}
