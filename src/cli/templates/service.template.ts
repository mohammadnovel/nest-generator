import { GeneratorOptions, capitalizeFirst, pluralize } from '../generator.utils';

export function generateService(options: GeneratorOptions): string {
  const { name, relations } = options;
  const className = capitalizeFirst(name);
  const pluralName = pluralize(name);
  const lowerPluralName = pluralName.toLowerCase();

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
    private readonly ${entity.name}Repository: Repository<${entity.className}>,`,
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

  return `import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ${className} } from './entities/${name}.entity';
import { Create${className}Dto } from './dto/create-${name}.dto';
import { Update${className}Dto } from './dto/update-${name}.dto';
${relatedImports}

@Injectable()
export class ${pluralize(className)}Service {
  constructor(
    @InjectRepository(${className})
    private readonly ${name}Repository: Repository<${className}>,
${relatedRepositories}
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(create${className}Dto: Create${className}Dto): Promise<${className}> {
    const ${name} = this.${name}Repository.create(create${className}Dto);

${relationHandling}

    const saved = await this.${name}Repository.save(${name});
    
    // Invalidate cache
    await this.cacheManager.del('${lowerPluralName}:all');
    
    return saved;
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: ${className}[]; total: number; page: number; lastPage: number }> {
    const cacheKey = \`${lowerPluralName}:page:\${page}:limit:\${limit}\`;
    
    // Try to get from cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached as { data: ${className}[]; total: number; page: number; lastPage: number };
    }

    // Fetch from database
    const [data, total] = await this.${name}Repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const result = {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };

    // Store in cache for 5 minutes (300 seconds)
    await this.cacheManager.set(cacheKey, result, 300);

    return result;
  }

  async findOne(id: string): Promise<${className}> {
    const cacheKey = \`${lowerPluralName}:id:\${id}\`;
    
    // Try to get from cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached as ${className};
    }

    // Fetch from database
    const ${name} = await this.${name}Repository.findOne({
      where: { id },
    });

    if (!${name}) {
      throw new NotFoundException(\`${className} with ID \${id} not found\`);
    }

    // Store in cache for 10 minutes (600 seconds)
    await this.cacheManager.set(cacheKey, ${name}, 600);

    return ${name};
  }

  async update(id: string, update${className}Dto: Update${className}Dto): Promise<${className}> {
    const ${name} = await this.findOne(id);

    Object.assign(${name}, update${className}Dto);

${updateRelationHandling}

    const updated = await this.${name}Repository.save(${name});
    
    // Invalidate cache
    await this.cacheManager.del(\`${lowerPluralName}:id:\${id}\`);
    await this.cacheManager.del('${lowerPluralName}:all');
    
    return updated;
  }

  async remove(id: string): Promise<void> {
    const ${name} = await this.findOne(id);
    await this.${name}Repository.softRemove(${name});
    
    // Invalidate cache
    await this.cacheManager.del(\`${lowerPluralName}:id:\${id}\`);
    await this.cacheManager.del('${lowerPluralName}:all');
  }
}
`;
}
