#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { GeneratorOptions, capitalizeFirst, pluralize } from './generator.utils';
import { generateEntity } from './templates/entity.template';
import { generateCreateDto, generateUpdateDto } from './templates/dto.template';
import { generateService } from './templates/service.template';
import { generateController } from './templates/controller.template';
import { generateModule } from './templates/module.template';
import { generateSeeder } from './templates/seeder.template';

function parseArguments(): { modelName: string; withSeed: boolean; seedCount: number } {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Error: Model name is required');
    console.log('\nUsage:');
    console.log('  npm run generate <model-name> [options]');
    console.log('\nOptions:');
    console.log('  --seed <count>    Generate dummy data seeder (default: 10 records)');
    console.log('\nExamples:');
    console.log('  npm run generate blog');
    console.log('  npm run generate product --seed 50');
    console.log('  npm run generate category --seed');
    process.exit(1);
  }

  const modelName = args[0].toLowerCase();
  const seedIndex = args.indexOf('--seed');
  const withSeed = seedIndex !== -1;
  let seedCount = 10;

  if (withSeed && args[seedIndex + 1] && !isNaN(parseInt(args[seedIndex + 1]))) {
    seedCount = parseInt(args[seedIndex + 1]);
  }

  return { modelName, withSeed, seedCount };
}

function generateDefaultFields(modelName: string) {
  // Generate sensible default fields based on common patterns
  const commonFields = [
    { name: 'name', type: 'string', required: true, unique: false },
    { name: 'description', type: 'string', required: false, unique: false },
  ];

  // Add specific fields based on model name
  if (modelName.includes('user') || modelName.includes('author')) {
    return [
      { name: 'email', type: 'string', required: true, unique: true },
      { name: 'name', type: 'string', required: true, unique: false },
    ];
  } else if (modelName.includes('post') || modelName.includes('blog') || modelName.includes('article')) {
    return [
      { name: 'title', type: 'string', required: true, unique: false },
      { name: 'content', type: 'string', required: true, unique: false },
      { name: 'published', type: 'boolean', required: true, unique: false },
    ];
  } else if (modelName.includes('product')) {
    return [
      { name: 'name', type: 'string', required: true, unique: false },
      { name: 'description', type: 'string', required: false, unique: false },
      { name: 'price', type: 'number', required: true, unique: false },
      { name: 'stock', type: 'number', required: true, unique: false },
    ];
  } else if (modelName.includes('category') || modelName.includes('tag')) {
    return [
      { name: 'name', type: 'string', required: true, unique: true },
      { name: 'description', type: 'string', required: false, unique: false },
    ];
  }

  return commonFields;
}

async function main() {
  console.log('🚀 NestJS Model Generator\n');

  const { modelName, withSeed, seedCount } = parseArguments();

  const options: GeneratorOptions = {
    name: modelName,
    fields: generateDefaultFields(modelName),
    relations: [],
    generateSeed: withSeed,
    seedCount: seedCount,
  };

  console.log(`📦 Generating MVC for: ${capitalizeFirst(modelName)}`);
  console.log(`📋 Default fields: ${options.fields.map(f => f.name).join(', ')}`);
  if (withSeed) {
    console.log(`🌱 Will generate ${seedCount} dummy records`);
  }
  console.log('');

  // Generate files
  console.log('📝 Creating files...\n');

  const basePath = path.join(process.cwd(), 'src', 'modules', pluralize(options.name));
  const dtoPath = path.join(basePath, 'dto');
  const entitiesPath = path.join(basePath, 'entities');
  const seedersPath = path.join(process.cwd(), 'src', 'database', 'seeders');

  // Create directories
  [basePath, dtoPath, entitiesPath, seedersPath].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Generate entity
  const entityContent = generateEntity(options);
  fs.writeFileSync(
    path.join(entitiesPath, `${options.name}.entity.ts`),
    entityContent,
  );
  console.log(`✅ Entity:     src/modules/${pluralize(options.name)}/entities/${options.name}.entity.ts`);

  // Generate DTOs
  const createDtoContent = generateCreateDto(options);
  fs.writeFileSync(
    path.join(dtoPath, `create-${options.name}.dto.ts`),
    createDtoContent,
  );
  console.log(`✅ Create DTO: src/modules/${pluralize(options.name)}/dto/create-${options.name}.dto.ts`);

  const updateDtoContent = generateUpdateDto(options);
  fs.writeFileSync(
    path.join(dtoPath, `update-${options.name}.dto.ts`),
    updateDtoContent,
  );
  console.log(`✅ Update DTO: src/modules/${pluralize(options.name)}/dto/update-${options.name}.dto.ts`);

  // Generate service
  const serviceContent = generateService(options);
  fs.writeFileSync(
    path.join(basePath, `${pluralize(options.name)}.service.ts`),
    serviceContent,
  );
  console.log(`✅ Service:    src/modules/${pluralize(options.name)}/${pluralize(options.name)}.service.ts`);

  // Generate controller
  const controllerContent = generateController(options);
  fs.writeFileSync(
    path.join(basePath, `${pluralize(options.name)}.controller.ts`),
    controllerContent,
  );
  console.log(`✅ Controller: src/modules/${pluralize(options.name)}/${pluralize(options.name)}.controller.ts`);

  // Generate module
  const moduleContent = generateModule(options);
  fs.writeFileSync(
    path.join(basePath, `${pluralize(options.name)}.module.ts`),
    moduleContent,
  );
  console.log(`✅ Module:     src/modules/${pluralize(options.name)}/${pluralize(options.name)}.module.ts`);

  // Generate seeder
  if (options.generateSeed) {
    const seederContent = generateSeeder(options);
    fs.writeFileSync(
      path.join(seedersPath, `${options.name}.seeder.ts`),
      seederContent,
    );
    console.log(`✅ Seeder:     src/database/seeders/${options.name}.seeder.ts`);
  }

  // Auto-update app.module.ts
  const appModulePath = path.join(process.cwd(), 'src', 'app.module.ts');
  if (fs.existsSync(appModulePath)) {
    let appModuleContent = fs.readFileSync(appModulePath, 'utf-8');
    const moduleName = `${pluralize(capitalizeFirst(options.name))}Module`;
    const importStatement = `import { ${moduleName} } from './modules/${pluralize(options.name)}/${pluralize(options.name)}.module';`;
    
    // Check if already imported
    if (!appModuleContent.includes(moduleName)) {
      // Add import
      const lastImportIndex = appModuleContent.lastIndexOf('import');
      const endOfLastImport = appModuleContent.indexOf(';', lastImportIndex) + 1;
      appModuleContent = 
        appModuleContent.slice(0, endOfLastImport) + 
        '\n' + importStatement + 
        appModuleContent.slice(endOfLastImport);
      
      // Add to imports array
      const importsMatch = appModuleContent.match(/imports:\s*\[([\s\S]*?)\]/);
      if (importsMatch) {
        const currentImports = importsMatch[1].trim();
        const newImports = currentImports 
          ? `${currentImports},\n    ${moduleName},`
          : `\n    ${moduleName},\n  `;
        appModuleContent = appModuleContent.replace(
          /imports:\s*\[([\s\S]*?)\]/,
          `imports: [${newImports}]`
        );
      }
      
      fs.writeFileSync(appModulePath, appModuleContent);
      console.log(`✅ Updated:    src/app.module.ts (auto-imported ${moduleName})`);
    }
  }

  console.log('\n✨ Generation complete!\n');
  console.log('📌 Generated routes:');
  console.log(`   POST   /${pluralize(options.name)}       - Create ${options.name}`);
  console.log(`   GET    /${pluralize(options.name)}       - List all ${pluralize(options.name)}`);
  console.log(`   GET    /${pluralize(options.name)}/:id   - Get ${options.name} by ID`);
  console.log(`   PATCH  /${pluralize(options.name)}/:id   - Update ${options.name}`);
  console.log(`   DELETE /${pluralize(options.name)}/:id   - Delete ${options.name}`);
  console.log('\n📚 Next steps:');
  console.log('   1. npm run start:dev');
  console.log('   2. Visit http://localhost:3000/api for Swagger docs');
  if (options.generateSeed) {
    console.log(`   3. npm run seed (to generate ${seedCount} dummy records)`);
  }
  console.log('\n');
}

main().catch(console.error);
