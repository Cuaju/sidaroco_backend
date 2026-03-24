# Sidaroco — Backend

> Microservices backend for **Sidaroco**, a bus operations and ticketing platform. Handles authentication, fleet management, route scheduling, ticket sales, financial reporting, and driver coordination across 7 independent services.

---

## What is Sidaroco?

Sidaroco is a transportation operations platform built for bus companies. It supports multiple user roles — customers, cashiers, route managers, finance managers, and drivers — each with their own set of features and access controls. The backend is structured as a pnpm monorepo with separate Express services communicating over HTTP, all behind a shared JWT authentication layer.

> **Frontend repo:** [sidaroco-web](https://github.com/Cuaju/sidaroco-web)

---

## Services

| Service | Port | Responsibility |
|---|---|---|
| authentication-service | 3000 | Login, JWT issuance |
| mail-service | 3002 | Email delivery |
| route-service | 3003 | Route definitions |
| ticket-service | 3004 | Ticket sales and reporting |
| users-service | 3005 | User accounts and profiles |
| schedule-service | 3006 | Daily schedules and trips |
| fleet-service | 3001 | Drivers and buses |

---

## Roles

| Role | Description |
|---|---|
| Customer | Browse routes, purchase tickets, view trip history |
| Cashier | Sell tickets on behalf of customers, daily cut reports |
| RouteManager | Manage routes, schedules, drivers, and buses |
| FinanceManager | Financial reports, earnings by route and cashier |
| Driver | View assigned trips and passenger manifests |

---

## Architecture

```
sidaroco_backend/
├── services/
│   ├── authenticationService/   # JWT auth & login
│   ├── fleet-service/           # Drivers & buses (with S3 photo upload)
│   ├── mail-service/            # Email delivery
│   ├── route-service/           # Route CRUD
│   ├── schedule-service/        # Daily schedules, trips, driver portal
│   ├── ticket-service/          # Tickets, payments, financial reports
│   └── users-service/           # Accounts, profiles, registration
├── packages/
│   ├── auth/                    # JWT signing/verification utilities
│   ├── auth_middleware/         # Shared Express RBAC middleware
│   ├── contracts/               # Shared TypeScript DTOs
│   └── keys/                    # Private/public keys for JWT
├── gateway/                     # API gateway (WIP)
└── docker-compose.yaml          # Full stack orchestration
```

Each service has its own PostgreSQL database and Prisma schema. Shared auth logic lives in `/packages` and is consumed by all services.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Runtime | Node.js |
| Framework | Express.js 5 |
| Package Manager | pnpm (monorepo workspaces) |
| Database | PostgreSQL 16 |
| ORM | Prisma |
| Authentication | JWT (RS256, shared key pair) |
| File Storage | AWS S3 (driver/bus photos) |
| Containerization | Docker & Docker Compose |

---

## Team

- [@Cuaju](https://github.com/Cuaju)
- [@unaay20](https://github.com/unaay20)
- [@marco1gk](https://github.com/marco1gk)
- [@AquilezE](http://github.com/AquilezE)

---
