# NestJS MVC Application

A full-featured NestJS application with TypeScript, PostgreSQL, Redis, JWT authentication, RBAC, model generator CLI, unit testing, security features, and PDF/Excel reporting capabilities.

## Features

✅ **TypeScript MVC Architecture** with NestJS  
✅ **PostgreSQL** database with TypeORM  
✅ **Redis** caching support  
✅ **JWT Authentication** with refresh tokens  
✅ **Role-Based Access Control (RBAC)** with permissions  
✅ **Model Generator CLI** - Generate complete CRUD modules with one command  
✅ **Relation Support** - Many-to-one, one-to-many, many-to-many  
✅ **Dummy Data Generation** with Faker.js  
✅ **Unit Tests** with Jest  
✅ **Security Features** - Helmet, CORS, Rate Limiting, SQL Injection Protection  
✅ **PDF & Excel Export** - Dynamic report generation  
✅ **Swagger/OpenAPI Documentation**  
✅ **Pagination, Filtering, Sorting**  
✅ **Soft Delete** functionality

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v15 or higher)
- Redis (v7 or higher)
- npm or yarn

## Installation

1. **Clone the repository**

   ```bash
   cd nestjs-mvc-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your database and Redis credentials
   ```

4. **Start PostgreSQL and Redis** (using Docker)

   ```bash
   docker-compose up -d
   ```

5. **Run database migrations** (if any)

   ```bash
   npm run migration:run
   ```

6. **Seed the database**
   ```bash
   npm run seed
   ```

## Running the Application

### Development mode

```bash
npm run start:dev
```

### Production mode

```bash
npm run build
npm run start:prod
```

The application will be available at `http://localhost:3000`  
Swagger documentation at `http://localhost:3000/api`

## Default Credentials

After seeding, you can login with:

- **Admin**: `admin@example.com` / `Admin123!`
- **User**: `user@example.com` / `User123!`

## Model Generator CLI

Generate complete CRUD modules with one simple command:

```bash
npm run generate <model-name> [--seed <count>]
```

### Quick Examples

```bash
# Generate blog module with default fields
npm run generate blog

# Generate product module with 50 dummy records
npm run generate product --seed 50

# Generate category module with seeder
npm run generate category --seed
```

### What Gets Generated

For `npm run generate blog`:

**Files Created:**

- ✅ `src/modules/blogs/entities/blog.entity.ts` - TypeORM entity
- ✅ `src/modules/blogs/dto/create-blog.dto.ts` - Create DTO with validation
- ✅ `src/modules/blogs/dto/update-blog.dto.ts` - Update DTO
- ✅ `src/modules/blogs/blogs.service.ts` - Service with CRUD operations
- ✅ `src/modules/blogs/blogs.controller.ts` - REST controller
- ✅ `src/modules/blogs/blogs.module.ts` - Module definition
- ✅ `src/database/seeders/blog.seeder.ts` - Seeder (if --seed flag used)

**Routes Auto-Created:**

- `POST /blogs` - Create blog
- `GET /blogs` - List all blogs (paginated)
- `GET /blogs/:id` - Get blog by ID
- `PATCH /blogs/:id` - Update blog
- `DELETE /blogs/:id` - Delete blog (soft delete)

**Auto-Imported:** Module is automatically added to `app.module.ts`!

### Default Fields by Model Type

The generator intelligently creates fields based on model name:

- **blog/post/article**: title, content, published
- **product**: name, description, price, stock
- **category/tag**: name, description
- **user**: email, name
- **default**: name, description

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token

### Users (Admin only)

- `GET /users` - List all users (paginated)
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user (soft delete)

### Roles (Admin only)

- `GET /roles` - List all roles
- `GET /roles/:id` - Get role by ID
- `POST /roles` - Create role
- `PATCH /roles/:id` - Update role
- `DELETE /roles/:id` - Delete role

### Permissions (Admin only)

- `GET /permissions` - List all permissions
- `GET /permissions/:id` - Get permission by ID
- `POST /permissions` - Create permission
- `PATCH /permissions/:id` - Update permission
- `DELETE /permissions/:id` - Delete permission

### Reports

- `GET /reports/export?entity=User&format=pdf` - Export to PDF
- `GET /reports/export?entity=User&format=excel` - Export to Excel
- Add filters: `&filters={"isActive":true}`

## Testing

```bash
# Unit tests
npm run test

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e

# Watch mode
npm run test:watch
```

## Security Features

- **Helmet** - Security headers
- **CORS** - Cross-Origin Resource Sharing
- **Rate Limiting** - 100 requests per minute
- **JWT** - Secure authentication
- **Password Hashing** - bcrypt with 10 salt rounds
- **SQL Injection Protection** - TypeORM parameterized queries
- **Input Validation** - class-validator decorators

## Project Structure

```
nestjs-mvc-app/
├── src/
│   ├── common/              # Shared utilities
│   │   ├── decorators/      # Custom decorators
│   │   ├── guards/          # Auth & permission guards
│   │   ├── interceptors/    # Logging interceptors
│   │   └── pipes/           # Validation pipes
│   ├── config/              # Configuration files
│   ├── modules/             # Feature modules
│   │   ├── auth/            # Authentication
│   │   ├── users/           # User management
│   │   ├── roles/           # Role management
│   │   ├── permissions/     # Permission management
│   │   └── reports/         # PDF/Excel reports
│   ├── database/
│   │   ├── entities/        # TypeORM entities
│   │   ├── migrations/      # Database migrations
│   │   └── seeders/         # Database seeders
│   ├── cli/                 # CLI commands
│   │   └── templates/       # Code generation templates
│   ├── app.module.ts
│   └── main.ts
├── test/                    # E2E tests
├── docs/                    # Documentation
├── .env                     # Environment variables
├── docker-compose.yml       # Docker services
└── package.json
```

## Documentation

- [API Documentation](docs/API.md) - Detailed API reference
- [Generator Guide](docs/GENERATOR.md) - Model generator usage
- [Architecture](docs/ARCHITECTURE.md) - System architecture

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:

- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
- `REDIS_HOST`, `REDIS_PORT`
- `JWT_SECRET`, `JWT_EXPIRATION`
- `SWAGGER_ENABLED`, `CORS_ENABLED`

## License

UNLICENSED

## Support

For issues and questions, please create an issue in the repository.
