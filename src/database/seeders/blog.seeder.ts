import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Blog } from '../../modules/blogs/entities/blog.entity';
import { Category } from '../../modules/categories/entities/category.entity';

export async function seedBlogs(dataSource: DataSource, count: number = 25): Promise<Blog[]> {
  const blogRepository = dataSource.getRepository(Blog);
  const categoryRepository = dataSource.getRepository(Category);

  // Check if blogs already exist
  const existingCount = await blogRepository.count();
  if (existingCount >= count) {
    console.log(`✅ Blogs already seeded (${existingCount} records)`);
    return await blogRepository.find();
  }

  // Get all categories
  const categories = await categoryRepository.find();
  if (categories.length === 0) {
    console.log('⚠️  No categories found. Please seed categories first.');
    return [];
  }

  const blogs: Blog[] = [];

  for (let i = 0; i < count; i++) {
    // Randomly assign category
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    const blog = blogRepository.create({
      title: faker.lorem.sentence({ min: 3, max: 8 }),
      content: faker.lorem.paragraphs(3, '\n\n'),
      published: faker.datatype.boolean(),
      categoryId: randomCategory.id,
    });
    blogs.push(blog);
  }

  const savedBlogs = await blogRepository.save(blogs);
  console.log(`✅ Created ${savedBlogs.length} blogs`);
  
  return savedBlogs;
}
