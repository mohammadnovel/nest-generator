# Menu Management Setup Guide

## Overview

Menu Management module dengan role-based access control telah dibuat. Module ini memungkinkan Anda untuk:

- Membuat menu dengan hierarki (parent-child)
- Mengatur akses menu berdasarkan role
- Mendapatkan menu tree structure
- Filter menu berdasarkan role

## Database Setup

Karena Docker tidak tersedia, setup PostgreSQL manual:

### 1. Install PostgreSQL

```bash
# MacOS
brew install postgresql@15
brew services start postgresql@15

# Atau gunakan PostgreSQL yang sudah terinstall
```

### 2. Create Database

```bash
# Login ke PostgreSQL
psql postgres

# Create database
CREATE DATABASE nestjs_mvc_app;

# Create user (optional)
CREATE USER nestjs_user WITH PASSWORD 'nestjs_password';
GRANT ALL PRIVILEGES ON DATABASE nestjs_mvc_app TO nestjs_user;

# Exit
\q
```

### 3. Update .env (jika perlu)

File `.env` sudah ada dengan konfigurasi default:

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=nestjs_mvc_app
```

## Running the Application

```bash
# Install dependencies (jika belum)
npm install

# Run database seeder
npm run seed

# Start development server
npm run start:dev
```

## Menu Management API

### Endpoints

#### 1. Create Menu

```http
POST /menus
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Dashboard",
  "description": "Main dashboard",
  "path": "/dashboard",
  "icon": "dashboard",
  "parentId": null,
  "order": 1,
  "isActive": true,
  "roleIds": ["admin-role-id", "user-role-id"]
}
```

#### 2. Get All Menus (Paginated)

```http
GET /menus?page=1&limit=10
Authorization: Bearer <token>
```

#### 3. Get Menu Hierarchy (Tree Structure)

```http
GET /menus/hierarchy/tree
Authorization: Bearer <token>
```

Response:

```json
[
  {
    "id": "uuid",
    "name": "Dashboard",
    "path": "/dashboard",
    "icon": "dashboard",
    "order": 1,
    "children": [
      {
        "id": "uuid",
        "name": "Analytics",
        "path": "/dashboard/analytics",
        "icon": "chart",
        "order": 1,
        "children": []
      }
    ]
  }
]
```

#### 4. Get Menus by Role

```http
GET /menus/role/:roleId
Authorization: Bearer <token>
```

Returns only active menus accessible by the specified role.

#### 5. Get Menu by ID

```http
GET /menus/:id
Authorization: Bearer <token>
```

#### 6. Update Menu

```http
PATCH /menus/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Dashboard",
  "roleIds": ["new-role-id"]
}
```

#### 7. Delete Menu (Soft Delete)

```http
DELETE /menus/:id
Authorization: Bearer <token>
```

## Example Usage

### 1. Login to get token

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'
```

Save the `access_token` from response.

### 2. Create Main Menus

```bash
# Dashboard Menu
curl -X POST http://localhost:3000/menus \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dashboard",
    "path": "/dashboard",
    "icon": "dashboard",
    "order": 1,
    "roleIds": ["admin-role-id", "user-role-id"]
  }'

# Users Menu (Admin only)
curl -X POST http://localhost:3000/menus \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Users",
    "path": "/users",
    "icon": "people",
    "order": 2,
    "roleIds": ["admin-role-id"]
  }'

# Reports Menu
curl -X POST http://localhost:3000/menus \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Reports",
    "path": "/reports",
    "icon": "assessment",
    "order": 3,
    "roleIds": ["admin-role-id", "user-role-id"]
  }'
```

### 3. Create Submenu

```bash
# Get parent menu ID first, then:
curl -X POST http://localhost:3000/menus \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Analytics",
    "path": "/dashboard/analytics",
    "icon": "chart",
    "parentId": "<dashboard-menu-id>",
    "order": 1,
    "roleIds": ["admin-role-id"]
  }'
```

### 4. Get Menu Hierarchy

```bash
curl -X GET http://localhost:3000/menus/hierarchy/tree \
  -H "Authorization: Bearer <token>"
```

### 5. Get Menus for Specific Role

```bash
# Get admin role menus
curl -X GET http://localhost:3000/menus/role/<admin-role-id> \
  -H "Authorization: Bearer <token>"
```

## Features

### ✅ Role-Based Access Control

- Each menu can be assigned to multiple roles
- Filter menus by role
- Only active menus are returned

### ✅ Hierarchical Structure

- Support for parent-child relationships
- Unlimited nesting levels
- Tree structure endpoint

### ✅ Menu Properties

- `name`: Menu display name
- `path`: Route path
- `icon`: Icon identifier
- `parentId`: Parent menu ID (null for root)
- `order`: Display order
- `isActive`: Enable/disable menu
- `roles`: Assigned roles

### ✅ Soft Delete

- Deleted menus are not permanently removed
- Can be restored if needed

## Integration with Frontend

### React/Vue/Angular Example

```typescript
// Fetch user's menus based on their role
async function getUserMenus(roleId: string) {
  const response = await fetch(`/api/menus/role/${roleId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
}

// Fetch full hierarchy
async function getMenuHierarchy() {
  const response = await fetch('/api/menus/hierarchy/tree', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
}

// Render menu recursively
function renderMenu(menus) {
  return menus.map(menu => (
    <MenuItem key={menu.id} to={menu.path} icon={menu.icon}>
      {menu.name}
      {menu.children && menu.children.length > 0 && (
        <SubMenu>{renderMenu(menu.children)}</SubMenu>
      )}
    </MenuItem>
  ));
}
```

## Swagger Documentation

Visit: `http://localhost:3000/api`

All endpoints are documented with:

- Request/Response schemas
- Example values
- Authentication requirements
- Role requirements

## Testing

```bash
# Run tests
npm run test

# Test menu service
npm run test -- menus.service.spec.ts
```

## Next Steps

1. ✅ Database setup
2. ✅ Run seeder
3. ✅ Start application
4. Create sample menus via API
5. Test role-based filtering
6. Integrate with frontend

## Summary

Menu Management module provides:

- Complete CRUD operations
- Role-based access control
- Hierarchical menu structure
- Tree structure endpoint
- Soft delete functionality
- Full Swagger documentation
- TypeScript type safety
- Validation with class-validator
