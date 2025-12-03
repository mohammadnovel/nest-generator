# API Documentation

Complete API reference for the NestJS MVC application.

## Base URL

```
http://localhost:3000
```

## Authentication

Most endpoints require JWT authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Access:** Public

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:** `201 Created`

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": [...]
  }
}
```

### Login

Authenticate and receive JWT tokens.

**Endpoint:** `POST /auth/login`

**Access:** Public

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### Refresh Token

Get a new access token using refresh token.

**Endpoint:** `POST /auth/refresh`

**Access:** Public

**Request Body:**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`

```json
{
  "access_token": "new_access_token",
  "refresh_token": "new_refresh_token",
  "user": { ... }
}
```

## User Management

### List Users

Get paginated list of users.

**Endpoint:** `GET /users`

**Access:** Admin only

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": true,
      "roles": [...],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 100
}
```

### Get User

Get user by ID.

**Endpoint:** `GET /users/:id`

**Access:** Authenticated

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "roles": [...],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Create User

Create a new user.

**Endpoint:** `POST /users`

**Access:** Admin only

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "roleIds": ["role-uuid-1", "role-uuid-2"]
}
```

**Response:** `201 Created`

### Update User

Update user information.

**Endpoint:** `PATCH /users/:id`

**Access:** Admin only

**Request Body:**

```json
{
  "firstName": "Updated Name",
  "roleIds": ["new-role-uuid"]
}
```

**Response:** `200 OK`

### Delete User

Soft delete a user.

**Endpoint:** `DELETE /users/:id`

**Access:** Admin only

**Response:** `200 OK`

## Role Management

### List Roles

**Endpoint:** `GET /roles`

**Access:** Authenticated

**Response:** `200 OK`

```json
[
  {
    "id": "uuid",
    "name": "admin",
    "description": "Administrator role",
    "permissions": [...]
  }
]
```

### Create Role

**Endpoint:** `POST /roles`

**Access:** Admin only

**Request Body:**

```json
{
  "name": "editor",
  "description": "Content editor role",
  "permissionIds": ["perm-uuid-1", "perm-uuid-2"]
}
```

**Response:** `201 Created`

## Permission Management

### List Permissions

**Endpoint:** `GET /permissions`

**Access:** Authenticated

**Response:** `200 OK`

```json
[
  {
    "id": "uuid",
    "name": "user:create",
    "description": "Create users",
    "resource": "user",
    "action": "create"
  }
]
```

### Create Permission

**Endpoint:** `POST /permissions`

**Access:** Admin only

**Request Body:**

```json
{
  "name": "blog:create",
  "description": "Create blog posts",
  "resource": "blog",
  "action": "create"
}
```

**Response:** `201 Created`

## Reports

### Export Data

Export entity data to PDF or Excel.

**Endpoint:** `GET /reports/export`

**Access:** Authenticated

**Query Parameters:**

- `entity` (required): Entity name (e.g., "User", "Blog")
- `format` (required): Export format ("pdf" or "excel")
- `filters` (optional): JSON string of filters (e.g., `{"isActive":true}`)

**Examples:**

Export users to PDF:

```
GET /reports/export?entity=User&format=pdf
```

Export active users to Excel:

```
GET /reports/export?entity=User&format=excel&filters={"isActive":true}
```

**Response:** Binary file download

## Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "User with ID xxx not found"
}
```

### 409 Conflict

```json
{
  "statusCode": 409,
  "message": "Email already exists"
}
```

## Rate Limiting

API is rate-limited to 100 requests per minute per IP address.

**Rate Limit Headers:**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

## Pagination

List endpoints support pagination with the following query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response includes:**

```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "lastPage": 10
}
```

## Swagger Documentation

Interactive API documentation is available at:

```
http://localhost:3000/api
```

Use Swagger UI to:

- Explore all endpoints
- Test API calls
- View request/response schemas
- Authenticate with JWT tokens
