# System Architecture

## Overview

This NestJS application follows a modular MVC (Model-View-Controller) architecture with clear separation of concerns, implementing best practices for enterprise-grade applications.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  (Web Browser, Mobile App, API Client)                      │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/HTTPS
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway Layer                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Helmet (Security Headers)                           │  │
│  │  CORS (Cross-Origin Resource Sharing)                │  │
│  │  Rate Limiter (100 req/min)                          │  │
│  │  Global Validation Pipe                              │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Authentication Layer                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  JWT Strategy                                         │  │
│  │  Local Strategy                                       │  │
│  │  Guards (JWT, Roles, Permissions)                    │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Controller Layer                          │
│  ┌─────────────┬─────────────┬─────────────┬────────────┐  │
│  │   Auth      │   Users     │   Roles     │  Reports   │  │
│  │ Controller  │ Controller  │ Controller  │ Controller │  │
│  └─────────────┴─────────────┴─────────────┴────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                            │
│  ┌─────────────┬─────────────┬─────────────┬────────────┐  │
│  │   Auth      │   Users     │   Roles     │  Reports   │  │
│  │  Service    │  Service    │  Service    │  Service   │  │
│  └─────────────┴─────────────┴─────────────┴────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
┌──────────────────┐   ┌──────────────────┐
│  PostgreSQL DB   │   │   Redis Cache    │
│  (TypeORM)       │   │                  │
└──────────────────┘   └──────────────────┘
```

## Layer Responsibilities

### 1. API Gateway Layer

**Purpose:** Handle cross-cutting concerns before requests reach business logic.

**Components:**

- **Helmet**: Sets secure HTTP headers
- **CORS**: Manages cross-origin requests
- **Rate Limiter**: Prevents abuse (100 requests/minute)
- **Validation Pipe**: Validates and transforms incoming data

### 2. Authentication Layer

**Purpose:** Secure the application and manage user identity.

**Components:**

- **JWT Strategy**: Validates JWT tokens
- **Local Strategy**: Handles email/password authentication
- **Guards**:
  - `JwtAuthGuard`: Protects routes requiring authentication
  - `RolesGuard`: Enforces role-based access
  - `PermissionsGuard`: Enforces permission-based access

### 3. Controller Layer

**Purpose:** Handle HTTP requests and responses.

**Responsibilities:**

- Route definition
- Request validation
- Response formatting
- Swagger documentation
- Delegate to services

**Example:**

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  @Get()
  @Roles('admin')
  findAll() { ... }
}
```

### 4. Service Layer

**Purpose:** Implement business logic.

**Responsibilities:**

- Business logic implementation
- Data validation
- Transaction management
- Error handling
- Repository interaction

**Example:**

```typescript
@Injectable()
export class UsersService {
  async create(dto: CreateUserDto): Promise<User> {
    // Business logic here
  }
}
```

### 5. Data Layer

**Components:**

- **PostgreSQL**: Primary data store
- **Redis**: Caching layer (future implementation)
- **TypeORM**: ORM for database operations

## Module Structure

### Core Modules

#### Auth Module

- **Purpose**: Authentication and authorization
- **Components**:
  - JWT/Local strategies
  - Auth service
  - Auth controller
  - Guards

#### Users Module

- **Purpose**: User management
- **Components**:
  - User entity
  - User service (CRUD)
  - User controller
  - DTOs

#### Roles Module

- **Purpose**: Role management
- **Components**:
  - Role entity
  - Role service
  - Role controller
  - Many-to-many with Users and Permissions

#### Permissions Module

- **Purpose**: Permission management
- **Components**:
  - Permission entity
  - Permission service
  - Permission controller

#### Reports Module

- **Purpose**: Data export
- **Components**:
  - PDF generation (pdfmake)
  - Excel generation (exceljs)
  - Dynamic report service

## Database Schema

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    Users    │────────▶│ User_Roles  │◀────────│    Roles    │
└─────────────┘         └─────────────┘         └─────────────┘
                                                        │
                                                        │
                                                        ▼
                                                ┌─────────────────┐
                                                │ Role_Permissions│
                                                └─────────────────┘
                                                        │
                                                        ▼
                                                ┌─────────────┐
                                                │ Permissions │
                                                └─────────────┘
```

### Entity Relationships

- **User ↔ Role**: Many-to-Many
- **Role ↔ Permission**: Many-to-Many
- **All entities**: Include soft delete, timestamps

## Security Architecture

### Authentication Flow

```
1. User sends credentials → POST /auth/login
2. LocalStrategy validates credentials
3. AuthService generates JWT tokens
4. Client receives access_token + refresh_token
5. Client includes token in Authorization header
6. JwtStrategy validates token on each request
7. User object attached to request
```

### Authorization Flow

```
1. Request arrives with JWT token
2. JwtAuthGuard validates token
3. RolesGuard checks user roles
4. PermissionsGuard checks user permissions
5. Request proceeds if authorized
```

### Security Features

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: Signed with secret key
- **Refresh Tokens**: Long-lived for token renewal
- **Rate Limiting**: 100 requests per minute
- **CORS**: Configurable origins
- **Helmet**: Security headers
- **SQL Injection**: TypeORM parameterized queries
- **Input Validation**: class-validator decorators

## Code Generation Architecture

### Generator CLI

The model generator uses a template-based approach:

```
User Input → Generator → Templates → Generated Files
```

**Templates:**

- Entity template (TypeORM decorators)
- DTO templates (validation decorators)
- Service template (CRUD operations)
- Controller template (REST endpoints)
- Module template (dependency injection)
- Seeder template (Faker.js data)

**Generated Structure:**

```
src/modules/{model}/
├── entities/{model}.entity.ts
├── dto/
│   ├── create-{model}.dto.ts
│   └── update-{model}.dto.ts
├── {model}s.service.ts
├── {model}s.controller.ts
└── {model}s.module.ts
```

## Scalability Considerations

### Horizontal Scaling

- Stateless architecture (JWT tokens)
- No server-side sessions
- Ready for load balancer

### Caching Strategy

- Redis integration prepared
- Cache-aside pattern
- TTL-based expiration

### Database Optimization

- Indexed columns (email, unique fields)
- Pagination for large datasets
- Soft delete for data retention
- Connection pooling

## Deployment Architecture

```
┌─────────────────────────────────────────────┐
│           Load Balancer (Nginx)             │
└────────────┬────────────────────────────────┘
             │
       ┌─────┴─────┐
       ▼           ▼
┌──────────┐  ┌──────────┐
│  App 1   │  │  App 2   │  (Multiple instances)
└────┬─────┘  └────┬─────┘
     │             │
     └──────┬──────┘
            ▼
    ┌──────────────┐
    │  PostgreSQL  │
    │   (Primary)  │
    └──────────────┘
            │
            ▼
    ┌──────────────┐
    │  PostgreSQL  │
    │  (Replica)   │
    └──────────────┘
```

## Testing Strategy

### Unit Tests

- Service layer logic
- Mocked dependencies
- Jest framework

### Integration Tests

- Controller + Service
- Database interactions
- Test database

### E2E Tests

- Full request/response cycle
- Authentication flow
- Complete user journeys

## Monitoring & Logging

### Logging Strategy

- Request/Response logging
- Error logging
- Audit logging (user actions)

### Metrics

- Request rate
- Response time
- Error rate
- Database query performance

## Future Enhancements

1. **Redis Caching**: Implement caching layer
2. **WebSockets**: Real-time features
3. **Message Queue**: Background jobs
4. **Microservices**: Service decomposition
5. **GraphQL**: Alternative API layer
6. **Elasticsearch**: Full-text search
