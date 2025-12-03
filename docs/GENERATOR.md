# Model Generator Guide

The NestJS Model Generator CLI automatically generates complete CRUD modules with a single command.

## Quick Start

```bash
npm run generate <model-name> [--seed <count>]
```

## Usage Examples

### Basic Generation

```bash
# Generate blog module with default fields
npm run generate blog
```

**Output:**

```
🚀 NestJS Model Generator

📦 Generating MVC for: Blog
📋 Default fields: title, content, published

📝 Creating files...

✅ Entity:     src/modules/blogs/entities/blog.entity.ts
✅ Create DTO: src/modules/blogs/dto/create-blog.dto.ts
✅ Update DTO: src/modules/blogs/dto/update-blog.dto.ts
✅ Service:    src/modules/blogs/blogs.service.ts
✅ Controller: src/modules/blogs/blogs.controller.ts
✅ Module:     src/modules/blogs/blogs.module.ts
✅ Updated:    src/app.module.ts (auto-imported BlogsModule)

✨ Generation complete!

📌 Generated routes:
   POST   /blogs       - Create blog
   GET    /blogs       - List all blogs
   GET    /blogs/:id   - Get blog by ID
   PATCH  /blogs/:id   - Update blog
   DELETE /blogs/:id   - Delete blog
```

### With Dummy Data

```bash
# Generate product module with 50 dummy records
npm run generate product --seed 50
```

This creates the module AND a seeder file that will generate 50 fake products using Faker.js.

### More Examples

```bash
# Category module with 10 dummy records (default)
npm run generate category --seed

# User module (no seeder)
npm run generate user

# Article module with 100 dummy records
npm run generate article --seed 100
```

## Smart Field Generation

The generator automatically creates appropriate fields based on the model name:

### Blog/Post/Article Models

```typescript
// Generates:
title: string(required);
content: string(required);
published: boolean(required);
```

### Product Models

```typescript
// Generates:
name: string(required);
description: string(optional);
price: number(required);
stock: number(required);
```

### Category/Tag Models

```typescript
// Generates:
name: string(required, unique);
description: string(optional);
```

### User Models

```typescript
// Generates:
email: string(required, unique);
name: string(required);
```

### Default (Other Models)

```typescript
// Generates:
name: string(required);
description: string(optional);
```

## Generated Code Features

### Entity (TypeORM)

- UUID primary key
- Soft delete support
- Timestamps (createdAt, updatedAt, deletedAt)
- Proper column decorators
- Table naming (pluralized, snake_case)

### DTOs

- Create DTO with class-validator decorators
- Update DTO using PartialType
- Swagger API property decorators
- Type-safe validation

### Service

- Full CRUD operations (create, findAll, findOne, update, remove)
- Pagination support (page, limit)
- Soft delete implementation
- Error handling with NotFoundException
- TypeORM repository pattern

### Controller

- RESTful endpoints
- JWT authentication required
- Role-based access control (@Roles decorator)
- Swagger documentation
- Pagination query parameters
- Proper HTTP status codes

### Module

- Dependency injection setup
- TypeORM feature registration
- Service and controller registration
- Export service for use in other modules

### Seeder (Optional)

- Faker.js integration
- Configurable record count
- Smart fake data based on field names
- Ready to run with `npm run seed`

## Auto-Import to App Module

The generator automatically:

1. Adds import statement to `app.module.ts`
2. Adds module to imports array
3. No manual configuration needed!

## Generated Routes

All generated modules include these REST endpoints:

| Method | Endpoint        | Description          | Auth Required   |
| ------ | --------------- | -------------------- | --------------- |
| POST   | `/{models}`     | Create new record    | ✅ (admin/user) |
| GET    | `/{models}`     | List all (paginated) | ✅              |
| GET    | `/{models}/:id` | Get by ID            | ✅              |
| PATCH  | `/{models}/:id` | Update record        | ✅ (admin/user) |
| DELETE | `/{models}/:id` | Soft delete          | ✅ (admin only) |

## Pagination

List endpoints support pagination:

```bash
GET /blogs?page=1&limit=10
```

Response includes:

```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "lastPage": 10
}
```

## Testing Generated Code

After generation:

```bash
# Start the app
npm run start:dev

# Visit Swagger docs
open http://localhost:3000/api

# Test the endpoints
# 1. Login to get JWT token
# 2. Use token in Authorization header
# 3. Try CRUD operations
```

## Seeding Data

If you used `--seed` flag:

```bash
# Run all seeders
npm run seed

# Or run specific seeder manually
ts-node src/database/seeders/blog.seeder.ts
```

## Customization

After generation, you can customize:

1. **Add more fields** to entity
2. **Add relations** to other entities
3. **Customize validation** in DTOs
4. **Add business logic** to service
5. **Change access control** in controller
6. **Modify seeder data** for better fake data

## Tips

✅ Use singular names (blog, not blogs)  
✅ Use lowercase (product, not Product)  
✅ Model names should be descriptive  
✅ Run generator from project root  
✅ Check Swagger docs after generation  
✅ Test endpoints before customizing

## Troubleshooting

**Module not found:**

- Make sure you're in the project root directory
- Check that `src/modules/` exists

**Import errors:**

- Run `npm run build` to check for TypeScript errors
- Ensure all dependencies are installed

**Routes not working:**

- Restart the dev server: `npm run start:dev`
- Check `app.module.ts` has the new module imported
- Verify JWT token is valid

## Advanced Usage

For complex models with relations, you can:

1. Generate base models first
2. Manually add relation decorators
3. Update DTOs to include relation IDs
4. Modify service to handle relations

Example:

```bash
# Generate both models
npm run generate category
npm run generate blog

# Then manually add to blog.entity.ts:
@ManyToOne(() => Category, (category) => category.blogs)
category: Category;

# And to create-blog.dto.ts:
@IsString()
@IsOptional()
categoryId?: string;
```

## Summary

The generator provides a solid foundation for your models:

- ✅ Complete MVC structure
- ✅ REST API endpoints
- ✅ Authentication & authorization
- ✅ Validation & error handling
- ✅ Database integration
- ✅ API documentation
- ✅ Optional dummy data

Focus on business logic, not boilerplate!
