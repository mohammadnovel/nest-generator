import { GeneratorOptions, capitalizeFirst, pluralize } from '../generator.utils';

export function generateService(options: GeneratorOptions): string {
  const { name, relations } = options;
  const className = capitalizeFirst(name);
  const pluralName = pluralize(name);

  // Get related entities for imports
  const relatedEntities = relations.map((rel) => ({
    className: capitalizeFirst(rel.target),
    name: rel.target,
    pluralName: pluralize(rel.target),
  }));

  const relatedImports = relatedEntities
    .map(
      (entity) =>
        `import { ${entity.className} } from '../../${entity.pluralName}/entities/${entity.name}.entity';`,
    )
    .join('\n');

  const relatedRepositories = relatedEntities
    .map(
      (entity) =>
        `    @InjectRepository(${entity.className})
    private ${entity.name}Repository: Repository<${entity.className}>,`,
    )
    .join('\n');

  // Generate relation handling in create method
  const relationHandling = relations
    .filter((rel) => rel.type === 'many-to-one' || rel.type === 'many-to-many')
    .map((rel) => {
      const targetClass = capitalizeFirst(rel.target);
      return `    if (create${className}Dto.${rel.name}Ids && create${className}Dto.${rel.name}Ids.length > 0) {
      ${name}.${rel.name} = await this.${rel.target}Repository.findByIds(create${className}Dto.${rel.name}Ids);
    }`;
    })
    .join('\n\n');

  const updateRelationHandling = relations
    .filter((rel) => rel.type === 'many-to-one' || rel.type === 'many-to-many')
    .map((rel) => {
      const targetClass = capitalizeFirst(rel.target);
      return `    if (update${className}Dto.${rel.name}Ids) {
      ${name}.${rel.name} = await this.${rel.target}Repository.findByIds(update${className}Dto.${rel.name}Ids);
    }`;
    })
    .join('\n\n');

  return `import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ${className} } from './entities/${name}.entity';
import { Create${className}Dto } from './dto/create-${name}.dto';
import { Update${className}Dto } from './dto/update-${name}.dto';
${relatedImports}

@Injectable()
export class ${pluralize(className)}Service {
  constructor(
    @InjectRepository(${className})
    private ${name}Repository: Repository<${className}>,
${relatedRepositories}
  ) {}

  async create(create${className}Dto: Create${className}Dto): Promise<${className}> {
    const ${name} = this.${name}Repository.create(create${className}Dto);

${relationHandling}

    return this.${name}Repository.save(${name});
  }

  async findAll(page = 1, limit = 10): Promise<{ data: ${className}[]; total: number; page: number; lastPage: number }> {
    const [data, total] = await this.${name}Repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<${className}> {
    const ${name} = await this.${name}Repository.findOne({
      where: { id },
    });

    if (!${name}) {
      throw new NotFoundException(\`${className} with ID \${id} not found\`);
    }

    return ${name};
  }

  async update(id: string, update${className}Dto: Update${className}Dto): Promise<${className}> {
    const ${name} = await this.findOne(id);

    Object.assign(${name}, update${className}Dto);

${updateRelationHandling}

    return this.${name}Repository.save(${name});
  }

  async remove(id: string): Promise<void> {
    const ${name} = await this.findOne(id);
    await this.${name}Repository.softRemove(${name});
  }
}
`;
}
