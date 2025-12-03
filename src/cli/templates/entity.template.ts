import { GeneratorOptions, capitalizeFirst, pluralize, toSnakeCase } from '../generator.utils';

export function generateEntity(options: GeneratorOptions): string {
  const { name, fields, relations } = options;
  const className = capitalizeFirst(name);
  const tableName = toSnakeCase(pluralize(name));

  const imports = new Set([
    'Entity',
    'PrimaryGeneratedColumn',
    'Column',
    'CreateDateColumn',
    'UpdateDateColumn',
    'DeleteDateColumn',
  ]);

  // Add relation imports
  relations.forEach((rel) => {
    if (rel.type === 'one-to-many') imports.add('OneToMany');
    if (rel.type === 'many-to-one') imports.add('ManyToOne');
    if (rel.type === 'many-to-many') {
      imports.add('ManyToMany');
      imports.add('JoinTable');
    }
  });

  const importList = Array.from(imports).join(', ');

  // Generate relation imports
  const relationImports = relations
    .map((rel) => {
      const targetClass = capitalizeFirst(rel.target);
      return `import { ${targetClass} } from '../../${pluralize(rel.target)}/entities/${rel.target}.entity';`;
    })
    .join('\n');

  // Generate fields
  const fieldDefinitions = fields
    .map((field) => {
      const decorators: string[] = [];
      const columnOptions: string[] = [];

      if (field.unique) columnOptions.push('unique: true');
      if (!field.required) columnOptions.push('nullable: true');
      if (field.default !== undefined) {
        columnOptions.push(`default: ${JSON.stringify(field.default)}`);
      }

      const columnDecorator =
        columnOptions.length > 0
          ? `@Column({ ${columnOptions.join(', ')} })`
          : '@Column()';

      return `  ${columnDecorator}\n  ${field.name}: ${field.type};`;
    })
    .join('\n\n');

  // Generate relations
  const relationDefinitions = relations
    .map((rel) => {
      const targetClass = capitalizeFirst(rel.target);
      const relName = rel.name;

      if (rel.type === 'many-to-one') {
        return `  @ManyToOne(() => ${targetClass}, (${rel.target}) => ${rel.target}.${pluralize(name)})\n  ${relName}: ${targetClass};`;
      } else if (rel.type === 'one-to-many') {
        return `  @OneToMany(() => ${targetClass}, (${rel.target}) => ${rel.target}.${name})\n  ${relName}: ${targetClass}[];`;
      } else if (rel.type === 'many-to-many') {
        return `  @ManyToMany(() => ${targetClass})\n  @JoinTable()\n  ${relName}: ${targetClass}[];`;
      }
    })
    .join('\n\n');

  return `import {
  ${importList},
} from 'typeorm';
${relationImports}

@Entity('${tableName}')
export class ${className} {
  @PrimaryGeneratedColumn('uuid')
  id: string;

${fieldDefinitions}

${relationDefinitions ? relationDefinitions + '\n\n' : ''}  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
`;
}
