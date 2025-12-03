import { DataSource } from 'typeorm';
import databaseConfig from '../../config/database.config';
import { seedCategories } from './category.seeder';
import { seedBlogs } from './blog.seeder';

async function runBlogCategorySeeder() {
  console.log('📦 Connecting to database...\n');

  const AppDataSource = new DataSource(databaseConfig() as any);

  try {
    await AppDataSource.initialize();
    console.log('📦 Database connection established\n');

    console.log('🌱 Seeding Categories and Blogs...\n');

    // Seed categories (5 records)
    await seedCategories(AppDataSource, 5);

    // Seed blogs (25 records with category relations)
    await seedBlogs(AppDataSource, 25);

    console.log('\n✨ Blog & Category seeding completed!\n');
    console.log('📊 Seeded data:');
    console.log('   - 5 Categories');
    console.log('   - 25 Blogs (with category relations)\n');

    await AppDataSource.destroy();
    console.log('👋 Database connection closed\n');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await AppDataSource.destroy();
    process.exit(1);
  }
}

runBlogCategorySeeder();
