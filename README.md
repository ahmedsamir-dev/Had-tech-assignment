# Gateway Management API - HAD Technical Assignment

A production-ready Node.js REST API for managing gateways and their associated peripheral devices. Built with TypeScript, Express.js, PostgreSQL, and Drizzle ORM following modern software architecture principles.

## 🎥 Demo Video

**📹 [Watch the 2-minute functionality demo](./DEMO.webm)**

Get a quick overview of the complete system in action - from Docker setup to API testing with Swagger UI, demonstrating all key features and business rules.

## 📋 Table of Contents

- [🎥 Demo Video](#🎥-demo-video)
- [🚀 Quick Start for Reviewers](#🚀-quick-start-for-reviewers)
- [🏗️ Architecture Overview](#🏗️-architecture-overview)
- [🗄️ Database Design](#🗄️-database-design)
- [📚 API Documentation](#📚-api-documentation)
- [🐳 Docker Configuration](#🐳-docker-configuration)
- [🛠️ Development Commands](#🛠️-development-commands)
- [🔧 Code Quality & Standards](#🔧-code-quality--standards)
- [📊 Project Structure](#📊-project-structure)

---

## 🚀 Quick Start for Reviewers

### Prerequisites

- **Docker & Docker Compose** (recommended - zero setup required)
- OR Node.js 22+ with pnpm (for local development)

### Option 1: Docker (Recommended for Review)

```bash
# Clone and navigate to project
git clone <repository-url>
cd HAD-Technical-Assignment

# Start everything with one command
pnpm docker:up

# The API will be available at:
# - http://localhost:3000/health (health check)
# - http://localhost:3000/api/docs (Swagger documentation)
# - PostgreSQL on localhost:5433
```

### Option 2: Local Development

```bash
# Install dependencies
pnpm install

# Set up environment (copy .env.example to .env if needed)
# Start local PostgreSQL or use Docker for DB only
docker compose up postgresdb -d

# Run migrations and start server
pnpm dev
```

### Quick API Test

```bash
# Health check
curl http://localhost:3000/health

# List gateways (should return 4 seeded gateways)
curl http://localhost:3000/api/v1/gateways

# Get gateway details
curl http://localhost:3000/api/v1/gateways/{gateway-id}
```

---

## 🏗️ Architecture Overview

### Software Architecture Pattern

- **Modular Monolith** with SOLID principles
- **Dependency Injection** using TSyringe container
- **Repository Pattern** for data access abstraction
- **Service Layer** for business logic encapsulation
- **DTO Pattern** with Zod validation for type safety

### Tech Stack

- **Runtime**: Node.js 22 (Alpine Docker image)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL 16 with Drizzle ORM
- **Validation**: Zod with zod-express-middleware
- **Logging**: Winston (structured logging) + Morgan (HTTP logs)
- **Documentation**: Swagger/OpenAPI with UI
- **Code Quality**: ESLint, Prettier, Lefthook pre-commit hooks
- **Containerization**: Multi-stage Docker builds with pnpm

### Core Dependencies

```json
{
  "drizzle-orm": "^0.33.0", // Type-safe SQL ORM
  "drizzle-kit": "^0.24.2", // Database migrations
  "express": "^4.21.2", // Web framework
  "zod": "^3.25.76", // Schema validation
  "winston": "^3.17.0", // Structured logging
  "swagger-jsdoc": "^6.2.8", // API documentation
  "tsyringe": "^4.10.0" // Dependency injection
}
```

---

## 🗄️ Database Design

### Schema Overview

```sql
-- Core entities with business relationships
gateways (1) ←→ (0-10) peripheral_devices
device_types (1) ←→ (*) peripheral_devices
gateways (1) ←→ (*) gateway_logs
```

### Key Business Rules

- ✅ **Maximum 10 devices per gateway** (enforced in service layer)
- ✅ **Device UID globally unique** (database constraint + validation)
- ✅ **Gateway serial_number immutable** (validation prevents updates)
- ✅ **IPv4 address validation** (Zod schema + PostgreSQL inet type)
- ✅ **Audit trail** (gateway_logs with JSONB details)
- ✅ **Orphaned device support** (devices can exist without gateway)

### Migration System

- **Drizzle Kit** for type-safe migrations
- **Automatic migration** on container startup
- **Seed data** for development/testing (4 gateways, 16 devices)

---

## 📚 API Documentation

### Swagger Documentation

- **URL**: `http://localhost:3000/api/docs`
- **Interactive API testing** with Try It Out feature
- **Complete schema documentation** with examples

### Core Endpoints

```http
# Gateway Management
POST   /api/v1/gateways              # Create gateway
GET    /api/v1/gateways              # List all (with pagination)
GET    /api/v1/gateways/:id          # Get gateway details
PATCH  /api/v1/gateways/:id          # Update gateway
DELETE /api/v1/gateways/:id          # Delete gateway

# Device Management
POST   /api/v1/gateways/:id/devices  # Attach device
DELETE /api/v1/gateways/:id/devices/:deviceId # Remove device
GET    /api/v1/devices               # List all devices
GET    /api/v1/devices/:id           # Get device details
```

### REST Client Testing

#### Using curl

```bash
# Create a gateway
curl -X POST http://localhost:3000/api/v1/gateways \
  -H "Content-Type: application/json" \
  -d '{
    "serialNumber": "GW-TEST-001",
    "name": "Test Gateway",
    "ipv4Address": "192.168.1.100",
    "location": "Test Lab"
  }'

# Attach a device
curl -X POST http://localhost:3000/api/v1/gateways/{gateway-id}/devices \
  -H "Content-Type: application/json" \
  -d '{
    "uid": 1001,
    "vendor": "Acme Corp",
    "status": "online",
    "deviceTypeId": 1
  }'
```

#### Using VS Code REST Client

```http
### Create Gateway
POST http://localhost:3000/api/v1/gateways
Content-Type: application/json

{
  "serialNumber": "GW-REST-001",
  "name": "REST Client Gateway",
  "ipv4Address": "10.0.0.100",
  "location": "VS Code Testing"
}

### Get All Gateways
GET http://localhost:3000/api/v1/gateways

### Attach Device to Gateway
POST http://localhost:3000/api/v1/gateways/{{gateway-id}}/devices
Content-Type: application/json

{
  "uid": 2001,
  "vendor": "Tech Solutions",
  "status": "online",
  "deviceTypeId": 2
}
```

### HTTP Test Files

- **Location**: `./http-tests/` directory
- **Files**: Complete workflow tests for all endpoints
- **Usage**: Open in VS Code with REST Client extension

---

## 🐳 Docker Configuration

### Multi-Stage Dockerfile

- **Base stage**: Node.js 22 Alpine with system dependencies
- **Dependencies stage**: pnpm install with caching
- **Build stage**: TypeScript compilation
- **Final stage**: Production-ready image with health checks

### Docker Compose Features

- **PostgreSQL 16** with persistent volumes
- **Automatic migrations** on container startup
- **Environment-based seeding** (dev data vs production)
- **Health checks** for both API and database
- **Network isolation** with custom bridge network

### Available Docker Commands

```bash
pnpm docker:up        # Build and start all services
pnpm docker:down      # Stop all services
pnpm docker:logs      # Follow API container logs
pnpm docker:restart   # Full restart with rebuild
```

---

## 🛠️ Development Commands

### Database Operations

```bash
pnpm db:generate      # Generate new migrations from schema changes
pnpm db:migrate       # Apply pending migrations
pnpm db:push          # Push schema directly (development)
pnpm db:studio        # Open Drizzle Studio (database GUI)
```

### Development Workflow

```bash
pnpm dev              # Start with hot reload
pnpm build            # TypeScript compilation
pnpm start            # Production server
pnpm typecheck        # Type checking only
```

### Quality & Linting

```bash
pnpm lint             # ESLint checking
pnpm lint:fix         # Auto-fix linting issues
pnpm format           # Prettier formatting
pnpm format:check     # Check formatting
```

---

## 🔧 Code Quality & Standards

### ESLint & Prettier Configuration

- **TypeScript strict mode** with comprehensive rules
- **Import sorting** and path alias support (`@/` for src)
- **Consistent formatting** with Prettier integration
- **Pre-commit hooks** via Lefthook

### Error Handling

- **Global error middleware** with structured error responses
- **Async error wrapping** for clean controller code
- **Validation error formatting** with detailed field information
- **HTTP status code consistency** across all endpoints

---

## 📊 Project Structure

```
src/
├── config/                 # Application configuration
│   ├── container.ts       # Dependency injection setup
│   ├── environment.ts     # Environment validation with Zod
│   └── swagger.ts         # API documentation config
├── database/              # Database layer
│   ├── connection.ts      # PostgreSQL connection with error handling
│   ├── migrations/        # Drizzle migration files
│   └── schema/           # Database schema definitions
├── modules/               # Feature modules
│   └── gateways/         # Gateway domain module
│       ├── controllers/   # HTTP request/response handling
│       ├── interfaces/    # TypeScript interfaces for DI
│       ├── repositories/  # Data access layer
│       ├── routes/        # Express route definitions
│       ├── services/      # Business logic implementation
│       ├── types/         # Domain-specific types
│       └── validation/    # Zod schemas and DTOs
└── shared/                # Shared utilities
    ├── factories/         # Factory patterns (Express app)
    ├── middleware/        # Custom middleware
    └── types/            # Common types (pagination, etc.)

scripts/                   # Database initialization scripts
├── init-db.sh            # Migration and seeding automation
├── seed-device-types.sql # Device type master data
└── seed-simple-test-data.sql # Development test data

postman/                   # Postman collections and environments
http-tests/               # VS Code REST Client test files
docs/                     # Additional documentation
```

### Key Architecture Decisions

1. **Module Boundary**: Each feature (gateways, devices) is self-contained
2. **Interface Segregation**: Repository and service interfaces for testability
3. **Type Safety**: End-to-end TypeScript with Zod validation
4. **Separation of Concerns**: Clear layers (routes → controllers → services → repositories)
5. **Configuration Management**: Environment-based config with validation
6. **Error Handling**: Centralized error middleware with structured responses

