# Quick Start Guide

## Prerequisites

- Node.js v18+
- PostgreSQL 15+
- npm or yarn

## 1. Setup Database

```bash
# Login to PostgreSQL
psql postgres

# Create database
CREATE DATABASE nestjs_mvc_app;

# Exit
\q
```

## 2. Install & Run

```bash
# Install dependencies
npm install

# Run database seeder (creates admin & user accounts)
npm run seed

# Start development server
npm run start:dev
```

## 3. Access Application

- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api

## 4. Default Login Credentials

```
Admin: admin@example.com / Admin123!
User:  user@example.com / User123!
```

## 5. Test Menu Management

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}'
```

### Create Menu

```bash
curl -X POST http://localhost:3000/menus \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dashboard",
    "path": "/dashboard",
    "icon": "dashboard",
    "order": 1
  }'
```

### Get Menu Hierarchy

```bash
curl http://localhost:3000/menus/hierarchy/tree \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 6. Generate New Module

```bash
# Generate blog module
npm run generate blog --seed 20

# Generate product module with 50 dummy records
npm run generate product --seed 50
```

## Features

✅ JWT Authentication  
✅ Role-Based Access Control (RBAC)  
✅ Menu Management with Hierarchy  
✅ Model Generator CLI  
✅ PDF & Excel Export  
✅ Swagger Documentation  
✅ Database Seeding  
✅ Soft Delete  
✅ Pagination

## Documentation

- [README.md](../README.md) - Complete documentation
- [API.md](API.md) - API endpoints reference
- [GENERATOR.md](GENERATOR.md) - Model generator guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [MENU_MANAGEMENT.md](MENU_MANAGEMENT.md) - Menu management guide

## Troubleshooting

### Database Connection Error

```bash
# Check PostgreSQL is running
brew services list

# Start PostgreSQL
brew services start postgresql@15
```

### Port Already in Use

```bash
# Change port in .env
PORT=3001
```

### Module Not Found

```bash
# Clear cache and rebuild
rm -rf dist node_modules
npm install
npm run build
```

## Next Steps

1. Explore Swagger UI at http://localhost:3000/api
2. Create custom menus for your application
3. Generate new modules with `npm run generate`
4. Customize generated code for your needs
5. Add unit tests for your modules
6. Deploy to production

Happy coding! 🚀
