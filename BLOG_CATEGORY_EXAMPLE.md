# Blog & Category Relation Example

## ✅ Generated Modules

### 1. Category Module

```bash
npm run generate category --seed 10
```

**Generated:**

- ✅ `src/modules/categories/entities/category.entity.ts`
- ✅ `src/modules/categories/dto/create-category.dto.ts`
- ✅ `src/modules/categories/dto/update-category.dto.ts`
- ✅ `src/modules/categories/categories.service.ts`
- ✅ `src/modules/categories/categories.controller.ts`
- ✅ `src/modules/categories/categories.module.ts`
- ✅ Auto-imported to `app.module.ts`

### 2. Blog Module (Already Generated)

```bash
npm run generate blog --seed 20
```

## 🔗 Relation Setup

### Blog Entity (Many-to-One)

```typescript
@Column({ nullable: true })
categoryId: string;

@ManyToOne(() => Category, (category) => category.blogs)
category: Category;
```

### Category Entity (One-to-Many)

```typescript
@OneToMany(() => Blog, (blog) => blog.category)
blogs: Blog[];
```

### Blog DTO

```typescript
@ApiProperty({ example: 'category-uuid-here', required: false })
@IsOptional()
@IsString()
categoryId?: string;
```

## 📊 Database Tables - AUTO CREATED!

Karena `DB_SYNCHRONIZE=true` di `.env`, TypeORM akan **otomatis membuat/update tables** saat aplikasi restart!

**Tables yang dibuat:**

```sql
-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY,
    name VARCHAR UNIQUE NOT NULL,
    description VARCHAR,
    "createdAt" TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "deletedAt" TIMESTAMP
);

-- Blogs table (dengan foreign key)
CREATE TABLE blogs (
    id UUID PRIMARY KEY,
    title VARCHAR NOT NULL,
    content VARCHAR NOT NULL,
    published BOOLEAN NOT NULL,
    "categoryId" UUID,  -- Foreign key ke categories
    "createdAt" TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "deletedAt" TIMESTAMP,
    CONSTRAINT "FK_blogs_category" FOREIGN KEY ("categoryId")
        REFERENCES categories(id)
);
```

## 🚀 Testing the Relation

### 1. Create Category

```bash
TOKEN="your-access-token"

curl -X POST http://localhost:3000/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Technology",
    "description": "Tech related posts"
  }'
```

**Response:**

```json
{
  "id": "abc-123-category-id",
  "name": "Technology",
  "description": "Tech related posts",
  "createdAt": "2025-12-03T...",
  "updatedAt": "2025-12-03T..."
}
```

### 2. Create Blog with Category

```bash
curl -X POST http://localhost:3000/blogs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to NestJS",
    "content": "NestJS is a progressive Node.js framework...",
    "published": true,
    "categoryId": "abc-123-category-id"
  }'
```

### 3. Get Blog with Category (if service loads relation)

```bash
curl http://localhost:3000/blogs/:id \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**

```json
{
  "id": "blog-id",
  "title": "Introduction to NestJS",
  "content": "NestJS is a progressive Node.js framework...",
  "published": true,
  "categoryId": "abc-123-category-id",
  "category": {
    "id": "abc-123-category-id",
    "name": "Technology",
    "description": "Tech related posts"
  }
}
```

### 4. Get Category with all Blogs

```bash
curl http://localhost:3000/categories/:id \
  -H "Authorization: Bearer $TOKEN"
```

## 🔄 Auto-Sync Behavior

### Development Mode (`DB_SYNCHRONIZE=true`)

✅ **Otomatis create tables**  
✅ **Otomatis update columns**  
✅ **Otomatis add foreign keys**  
⚠️ **JANGAN gunakan di production!**

### Production Mode

❌ Disable `DB_SYNCHRONIZE`  
✅ Gunakan migrations:

```bash
npm run migration:generate -- AddCategoryToBlog
npm run migration:run
```

## 📝 Verify Tables Created

```bash
psql -U postgres nestjs_mvc_app

# List tables
\dt

# Check blogs table structure
\d blogs

# Check foreign key
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name='blogs' AND tc.constraint_type = 'FOREIGN KEY';
```

**Expected Output:**

```
 table_name | column_name | foreign_table_name | foreign_column_name
------------+-------------+--------------------+---------------------
 blogs      | categoryId  | categories         | id
```

## 🎯 Update Service to Load Relations

### blogs.service.ts

```typescript
async findOne(id: string): Promise<Blog> {
  const blog = await this.blogRepository.findOne({
    where: { id },
    relations: ['category'], // Load category relation
  });

  if (!blog) {
    throw new NotFoundException(`Blog with ID ${id} not found`);
  }

  return blog;
}

async findAll(page: number = 1, limit: number = 10) {
  const [data, total] = await this.blogRepository.findAndCount({
    relations: ['category'], // Load category relation
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    data,
    total,
    page,
    lastPage: Math.ceil(total / limit),
  };
}
```

### categories.service.ts

```typescript
async findOne(id: string): Promise<Category> {
  const category = await this.categoryRepository.findOne({
    where: { id },
    relations: ['blogs'], // Load blogs relation
  });

  if (!category) {
    throw new NotFoundException(`Category with ID ${id} not found`);
  }

  return category;
}
```

## ✨ Summary

**✅ Category module generated**  
**✅ Blog-Category relation added**  
**✅ Tables auto-created in PostgreSQL**  
**✅ Foreign key constraint added**  
**✅ DTOs updated**  
**✅ Ready to use!**

**Restart aplikasi untuk apply changes:**

```bash
# Aplikasi sudah auto-reload dengan watch mode!
# Atau manual restart:
# Ctrl+C di terminal yang running
npm run start:dev
```

**Check Swagger:**
http://localhost:3000/api

Sekarang Blog punya field `categoryId` dan Category punya array `blogs`! 🎉
