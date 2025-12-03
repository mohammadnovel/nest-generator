import { GeneratorOptions, capitalizeFirst } from '../generator.utils';

export function generateCreateDto(options: GeneratorOptions): string {
  const { name, fields, relations } = options;
  const className = capitalizeFirst(name);

  const fieldDefinitions = fields
    .map((field) => {
      const validators: string[] = [];

      if (field.type === 'string') validators.push('@IsString()');
      if (field.type === 'number') validators.push('@IsNumber()');
      if (field.type === 'boolean') validators.push('@IsBoolean()');
      if (field.required) validators.push('@IsNotEmpty()');
      if (!field.required) validators.push('@IsOptional()');

      const exampleValue =
        field.type === 'string'
          ? `'Example ${field.name}'`
          : field.type === 'number'
          ? '1'
          : field.type === 'boolean'
          ? 'true'
          : 'null';

      return `  @ApiProperty({ example: ${exampleValue}${!field.required ? ', required: false' : ''} })
${validators.map((v) => '  ' + v).join('\n')}
  ${field.name}${!field.required ? '?' : ''}: ${field.type};`;
    })
    .join('\n\n');

  // Add relation fields
  const relationFields = relations
    .filter((rel) => rel.type === 'many-to-one' || rel.type === 'many-to-many')
    .map((rel) => {
      const isArray = rel.type === 'many-to-many';
      return `  @ApiProperty({ example: ['uuid-here'], required: false })
  @IsOptional()
  @IsString({ each: true })
  ${rel.name}Ids?: string[];`;
    })
    .join('\n\n');

  return `import { IsString, IsNumber, IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Create${className}Dto {
${fieldDefinitions}${relationFields ? '\n\n' + relationFields : ''}
}
`;
}

export function generateUpdateDto(options: GeneratorOptions): string {
  const { name } = options;
  const className = capitalizeFirst(name);

  return `import { PartialType } from '@nestjs/swagger';
import { Create${className}Dto } from './create-${name}.dto';

export class Update${className}Dto extends PartialType(Create${className}Dto) {}
`;
}
