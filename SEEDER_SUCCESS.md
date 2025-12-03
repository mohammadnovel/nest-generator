# 🎉 Blog & Category Seeder - SUCCESS!

## ✅ Seeding Completed

```bash
npm run seed:blog
```

**Output:**

```
📦 Connecting to database...
📦 Database connection established

🌱 Seeding Categories and Blogs...

✅ Created 5 categories
✅ Created 25 blogs

✨ Blog & Category seeding completed!

📊 Seeded data:
   - 5 Categories
   - 25 Blogs (with category relations)

👋 Database connection closed
```

## 📊 Seeded Data

### Categories (5 records)

1. Technology
2. Business
3. Lifestyle
4. Health & Fitness
5. Travel

### Blogs (25 records)

- Each blog has a random category assigned
- Each blog has:
  - `title`: Random sentence (3-8 words)
  - `content`: 3 paragraphs of lorem ipsum
  - `published`: Random true/false
  - `categoryId`: Random category from the 5 categories

## 🔍 Verify Data

### Check Categories

```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}' \
  | jq -r '.access_token')

# Get categories
curl -s http://localhost:3000/categories \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.data[] | {name, description}'
```

**Expected Output:**

```json
{
  "name": "Technology",
  "description": "..."
}
{
  "name": "Business",
  "description": "..."
}
...
```

### Check Blogs with Category

```bash
# Get blogs (paginated, 10 per page)
curl -s http://localhost:3000/blogs \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.data[] | {title, published, category: .category.name}'
```

**Expected Output:**

```json
{
  "title": "Voluptatem quisquam sed...",
  "published": true,
  "category": "Technology"
}
{
  "title": "Consequatur et ipsum...",
  "published": false,
  "category": "Business"
}
...
```

### Get Category with All Blogs

```bash
# Get first category ID
CATEGORY_ID=$(curl -s http://localhost:3000/categories \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.data[0].id')

# Get category with blogs
curl -s http://localhost:3000/categories/$CATEGORY_ID \
  -H "Authorization: Bearer $TOKEN" \
  | jq '{name, blogs: .blogs | length, blog_titles: .blogs[].title}'
```

## 📝 Seeder Files Created

### 1. Category Seeder

**File:** `src/database/seeders/category.seeder.ts`

```typescript
export async function seedCategories(dataSource: DataSource, count: number = 5);
```

**Features:**

- Predefined category names (Technology, Business, etc.)
- Checks if already seeded (idempotent)
- Returns created categories

### 2. Blog Seeder

**File:** `src/database/seeders/blog.seeder.ts`

```typescript
export async function seedBlogs(dataSource: DataSource, count: number = 25);
```

**Features:**

- Random title (faker.lorem.sentence)
- Random content (faker.lorem.paragraphs)
- Random published status
- Random category assignment
- Checks if already seeded (idempotent)

### 3. Standalone Runner

**File:** `src/database/seeders/run-blog-category-seeder.ts`

Runs only blog & category seeders without touching users/roles/permissions.

## 🚀 Usage

### Seed Everything (Users + Blogs)

```bash
npm run seed
```

### Seed Only Blogs & Categories

```bash
npm run seed:blog
```

### Re-seed (Clear First)

```bash
# Delete existing data
psql -U postgres nestjs_mvc_app -c "TRUNCATE blogs, categories RESTART IDENTITY CASCADE;"

# Re-seed
npm run seed:blog
```

## 📊 Database Verification

```bash
psql -U postgres nestjs_mvc_app

# Count records
SELECT 'categories' as table, COUNT(*) FROM categories
UNION ALL
SELECT 'blogs', COUNT(*) FROM blogs;

# Check relations
SELECT
  b.title,
  b.published,
  c.name as category_name
FROM blogs b
LEFT JOIN categories c ON b."categoryId" = c.id
LIMIT 5;

# Count blogs per category
SELECT
  c.name,
  COUNT(b.id) as blog_count
FROM categories c
LEFT JOIN blogs b ON c.id = b."categoryId"
GROUP BY c.name
ORDER BY blog_count DESC;
```

**Expected Output:**

```
    table     | count
--------------+-------
 categories   |     5
 blogs        |    25

      title       | published | category_name
------------------+-----------+---------------
 Voluptatem...    | t         | Technology
 Consequatur...   | f         | Business
 ...
```

## 🎯 Swagger Testing

1. **Open Swagger:** http://localhost:3000/api

2. **Authorize:**
   - Click "Authorize" button
   - Login: `admin@example.com` / `Admin123!`
   - Copy access token
   - Paste in authorization

3. **Test Endpoints:**
   - `GET /categories` - See all 5 categories
   - `GET /blogs` - See 10 blogs (paginated)
   - `GET /blogs?page=2` - See next 10 blogs
   - `GET /blogs?page=3` - See last 5 blogs
   - `GET /categories/{id}` - See category with all its blogs

## ✨ Summary

**✅ Seeder Working!**

- 5 Categories created
- 25 Blogs created with category relations
- All data accessible via API
- Relations properly loaded
- Idempotent (can run multiple times safely)

**Next Steps:**

- Test CRUD operations in Swagger
- Create new blogs via API
- Update blog categories
- Filter blogs by category (can add custom endpoint)

**Happy Testing! 🚀**
