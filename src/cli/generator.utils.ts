export interface GeneratorOptions {
  name: string;
  fields: FieldDefinition[];
  relations: RelationDefinition[];
  generateSeed: boolean;
  seedCount: number;
}

export interface FieldDefinition {
  name: string;
  type: string;
  required: boolean;
  unique: boolean;
  default?: any;
}

export interface RelationDefinition {
  name: string;
  type: 'one-to-many' | 'many-to-one' | 'many-to-many';
  target: string;
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

export function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function toSnakeCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
}

export function pluralize(str: string): string {
  if (str.endsWith('y')) {
    return str.slice(0, -1) + 'ies';
  }
  if (str.endsWith('s')) {
    return str + 'es';
  }
  return str + 's';
}
