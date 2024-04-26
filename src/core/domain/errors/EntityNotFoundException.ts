export class EntityNotFoundException extends Error {
  constructor(entityName: string, identifier: string | null = null) {
    super();
    if (identifier) {
      this.message = `Entity ${entityName} identified by ${identifier} could not be found`;
    } else {
      this.message = `Entity ${entityName} identified could not be found`;
    }
    this.name = "EntityNotFoundException";
  }
}
