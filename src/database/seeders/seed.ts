import { DataSource } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';
import { Role } from '../../modules/roles/entities/role.entity';
import { Permission } from '../../modules/permissions/entities/permission.entity';
import { seedCategories } from './category.seeder';
import { seedBlogs } from './blog.seeder';

export async function seedDatabase(dataSource: DataSource) {
  console.log('🌱 Starting database seeding...\n');

  // Create permissions
  const permissionRepository = dataSource.getRepository(Permission);
  const permissions = [
    {
      name: 'user:create',
      description: 'Create users',
      resource: 'user',
      action: 'create',
    },
    {
      name: 'user:read',
      description: 'Read users',
      resource: 'user',
      action: 'read',
    },
    {
      name: 'user:update',
      description: 'Update users',
      resource: 'user',
      action: 'update',
    },
    {
      name: 'user:delete',
      description: 'Delete users',
      resource: 'user',
      action: 'delete',
    },
    {
      name: 'role:manage',
      description: 'Manage roles',
      resource: 'role',
      action: 'manage',
    },
  ];

  const createdPermissions = await permissionRepository.save(permissions);
  console.log(`✅ Created ${createdPermissions.length} permissions`);

  // Create roles
  const roleRepository = dataSource.getRepository(Role);
  const adminRole = roleRepository.create({
    name: 'admin',
    description: 'Administrator with full access',
    permissions: createdPermissions,
  });

  const userRole = roleRepository.create({
    name: 'user',
    description: 'Regular user',
    permissions: createdPermissions.filter((p) => p.resource === 'user' && p.action === 'read'),
  });

  await roleRepository.save([adminRole, userRole]);
  console.log('✅ Created roles: admin, user');

  // Create admin user
  const userRepository = dataSource.getRepository(User);
  const adminUser = userRepository.create({
    email: 'admin@example.com',
    password: 'Admin123!',
    firstName: 'Admin',
    lastName: 'User',
    roles: [adminRole],
  });

  const regularUser = userRepository.create({
    email: 'user@example.com',
    password: 'User123!',
    firstName: 'Regular',
    lastName: 'User',
    roles: [userRole],
  });

  await userRepository.save([adminUser, regularUser]);
  console.log('✅ Created users: admin@example.com, user@example.com');

  // Seed categories (5 records)
  await seedCategories(dataSource, 5);

  // Seed blogs (25 records with category relations)
  await seedBlogs(dataSource, 25);

  console.log('\n✨ Database seeding completed!\n');
  console.log('📌 Login credentials:');
  console.log('   Admin: admin@example.com / Admin123!');
  console.log('   User:  user@example.com / User123!\n');
  console.log('📊 Seeded data:');
  console.log('   - 5 Categories');
  console.log('   - 25 Blogs (with category relations)\n');
}
