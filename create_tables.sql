-- NestJS MVC App - Database Tables
-- Run this file: psql -U postgres nestjs_mvc_app < create_tables.sql

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    description VARCHAR,
    resource VARCHAR NOT NULL,
    action VARCHAR NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL UNIQUE,
    description VARCHAR,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR NOT NULL UNIQUE,
    password VARCHAR NOT NULL,
    "firstName" VARCHAR NOT NULL,
    "lastName" VARCHAR NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    "deletedAt" TIMESTAMP
);

-- Role-Permission junction table
CREATE TABLE IF NOT EXISTS role_permissions (
    "roleId" UUID REFERENCES roles(id) ON DELETE CASCADE,
    "permissionId" UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY ("roleId", "permissionId")
);

-- User-Role junction table
CREATE TABLE IF NOT EXISTS user_roles (
    "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
    "roleId" UUID REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY ("userId", "roleId")
);

-- Menus table
CREATE TABLE IF NOT EXISTS menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    description VARCHAR,
    path VARCHAR NOT NULL,
    icon VARCHAR,
    "parentId" UUID,
    "order" INTEGER DEFAULT 0,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    "deletedAt" TIMESTAMP
);

-- Menu-Role junction table
CREATE TABLE IF NOT EXISTS menu_roles (
    menu_id UUID REFERENCES menus(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (menu_id, role_id)
);

-- Success message
\echo 'Tables created successfully!'
\echo 'Run: npm run seed'
