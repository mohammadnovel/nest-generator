import { GeneratorOptions, capitalizeFirst, pluralize } from '../generator.utils';

export function generateModule(options: GeneratorOptions): string {
  const { name, relations } = options;
  const className = capitalizeFirst(name);
  const pluralName = pluralize(name);
  const pluralClassName = pluralize(className);

  // Get related entities for imports
  const relatedEntities = relations.map((rel) => ({
    className: capitalizeFirst(rel.target),
    name: rel.target,
    pluralName: pluralize(rel.target),
  }));

  const relatedImports = relatedEntities
    .map(
      (entity) =>
        `import { ${entity.className} } from '../${entity.pluralName}/entities/${entity.name}.entity';`,
    )
    .join('\n');

  const entityList = [className, ...relatedEntities.map((e) => e.className)].join(', ');

  return `import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ${pluralClassName}Service } from './${pluralName}.service';
import { ${pluralClassName}Controller } from './${pluralName}.controller';
import { ${className} } from './entities/${name}.entity';
${relatedImports}

@Module({
  imports: [TypeOrmModule.forFeature([${entityList}])],
  controllers: [${pluralClassName}Controller],
  providers: [${pluralClassName}Service],
  exports: [${pluralClassName}Service],
})
export class ${pluralClassName}Module {}
`;
}
