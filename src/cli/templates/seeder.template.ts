import { GeneratorOptions, capitalizeFirst, pluralize } from '../generator.utils';

export function generateSeeder(options: GeneratorOptions): string {
  const { name, fields } = options;
  const className = capitalizeFirst(name);
  const pluralName = pluralize(name);

  // Generate fake data for each field
  const fakeDataFields = fields
    .map((field) => {
      let fakerMethod = 'faker.lorem.word()';

      if (field.name.toLowerCase().includes('title')) {
        fakerMethod = 'faker.lorem.sentence()';
      } else if (field.name.toLowerCase().includes('description') || field.name.toLowerCase().includes('content')) {
        fakerMethod = 'faker.lorem.paragraph()';
      } else if (field.name.toLowerCase().includes('email')) {
        fakerMethod = 'faker.internet.email()';
      } else if (field.name.toLowerCase().includes('name')) {
        fakerMethod = 'faker.person.fullName()';
      } else if (field.name.toLowerCase().includes('url') || field.name.toLowerCase().includes('link')) {
        fakerMethod = 'faker.internet.url()';
      } else if (field.name.toLowerCase().includes('image') || field.name.toLowerCase().includes('photo')) {
        fakerMethod = 'faker.image.url()';
      } else if (field.type === 'number') {
        fakerMethod = 'faker.number.int({ min: 1, max: 100 })';
      } else if (field.type === 'boolean') {
        fakerMethod = 'faker.datatype.boolean()';
      }

      return `        ${field.name}: ${fakerMethod},`;
    })
    .join('\n');

  return `import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { ${className} } from '../entities/${name}.entity';

export async function seed${pluralize(className)}(dataSource: DataSource, count = 10) {
  const ${name}Repository = dataSource.getRepository(${className});

  const ${pluralName} = [];

  for (let i = 0; i < count; i++) {
    const ${name} = ${name}Repository.create({
${fakeDataFields}
    });

    ${pluralName}.push(${name});
  }

  await ${name}Repository.save(${pluralName});

  console.log(\`✅ Seeded \${count} ${pluralName}\`);
}
`;
}
