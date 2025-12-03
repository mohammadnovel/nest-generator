import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Category } from '../../modules/categories/entities/category.entity';

export async function seedCategories(dataSource: DataSource, count: number = 5): Promise<Category[]> {
  const categoryRepository = dataSource.getRepository(Category);

  // Check if categories already exist
  const existingCount = await categoryRepository.count();
  if (existingCount >= count) {
    console.log(`✅ Categories already seeded (${existingCount} records)`);
    return await categoryRepository.find();
  }

  const categories: Category[] = [];
  const categoryNames = [
    'Technology',
    'Business',
    'Lifestyle',
    'Health & Fitness',
    'Travel',
    'Food & Cooking',
    'Entertainment',
    'Sports',
    'Education',
    'Science',
  ];

  for (let i = 0; i < count; i++) {
    const category = categoryRepository.create({
      name: categoryNames[i] || faker.commerce.department(),
      description: faker.lorem.sentence(),
    });
    categories.push(category);
  }

  const savedCategories = await categoryRepository.save(categories);
  console.log(`✅ Created ${savedCategories.length} categories`);
  
  return savedCategories;
}
