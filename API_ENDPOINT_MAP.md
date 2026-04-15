# Web-Admin API Endpoint Map

This document provides a comprehensive visual map of all API endpoints used by the web-admin application.

---

## Authentication & Session

```
POST   /admin/login                          → Admin authentication
```

---

## Dashboard & Analytics

```
GET    /admin/stats                          → Dashboard statistics (users, bookings, revenue)
GET    /admin/revenue-chart                  → 30-day revenue chart data
GET    /admin/recent-activity                → Recent platform activity
GET    /admin/recent-transactions            → Recent payment transactions
```

---

## Pros Management

```
GET    /admin/pros                           → List all pros (with filters)
       ?status={all|pending|active|suspended|rejected}
       ?category={category}
       ?search={query}

GET    /admin/pros/:id                       → Get specific pro details

POST   /admin/pros                           → Create new pro
       Body: { email, phone, firstName, lastName, serviceCategories, ... }

PATCH  /admin/pros/:id                       → Update pro information
       Body: { serviceCategories, address, bio, ... }

PUT    /admin/pros/:id/validate              → Validate or reject pro
       Body: { approved: boolean, reason?: string }

DELETE /admin/pros/:id                       → Delete pro permanently
```

---

## Drivers Management

```
GET    /admin/drivers                        → List all drivers (with filters)
       ?status={all|pending|active|suspended|rejected}
       ?vehicleType={type}
       ?search={query}

GET    /admin/drivers/:id                    → Get specific driver details

POST   /admin/drivers                        → Create new driver
       Body: { email, phone, firstName, lastName, vehicleType, licensePlate, ... }

PATCH  /admin/drivers/:id                    → Update driver information
       Body: { vehicleType, licensePlate, vehicleCapacity, ... }

PUT    /admin/drivers/:id/validate           → Validate or reject driver
       Body: { approved: boolean, reason?: string }

DELETE /admin/drivers/:id                    → Delete driver permanently
```

---

## Sellers Management

```
GET    /admin/sellers                        → List all sellers (with filters)
       ?status={all|pending|active|suspended|rejected}
       ?search={query}

GET    /admin/sellers/:id                    → Get specific seller details

POST   /admin/sellers                        → Create new seller
       Body: { email, phone, businessName, categories, address, ... }

PATCH  /admin/sellers/:id                    → Update seller information
       Body: { businessName, categories, address, ... }

PUT    /admin/sellers/:id/validate           → Validate or reject seller
       Body: { approved: boolean, reason?: string }

DELETE /admin/sellers/:id                    → Delete seller permanently
```

---

## Products Management

```
GET    /admin/products                       → List all products (with filters)
       ?status={all|active|inactive}
       ?search={query}

PUT    /admin/products/:id/moderate          → Approve or reject product
       Body: { approved: boolean, reason?: string }

DELETE /admin/products/:id                   → Delete product permanently
```

---

## Transactions & Payments

```
GET    /admin/transactions                   → List all transactions (with filters)
       ?status={all|pending|completed|failed}
       ?escrowStatus={all|held|released|refunded}
       ?search={query}

GET    /admin/transactions/:id               → Get specific transaction details
```

---

## Disputes Management

```
GET    /admin/disputes                       → List all disputes (with filters)
       ?status={all|pending|resolved}

GET    /admin/disputes/:id                   → Get specific dispute details ⚠️ FIX REQUIRED

PUT    /admin/disputes/:id/resolve           → Resolve a dispute
       Body: { resolution: string, resolvedInFavorOf: 'client' | 'pro' }
```

**Note:** ⚠️ The dispute detail endpoint in `disputes/[id]/page.tsx` currently calls `/disputes/:id` but should call `/admin/disputes/:id`

---

## User Management (Cross-module)

```
PATCH  /admin/users/:id/suspend              → Suspend user account
PATCH  /admin/users/:id/reactivate           → Reactivate suspended user account
```

**Used for:** Pros, Drivers, and Sellers user account management

---

## Settings Management

```
GET    /admin/settings                       → Get platform settings
       Returns: {
         commissionRates: { services, transport, marketplace },
         serviceCategories: [...],
         serviceZones: [...],
         exchangeRates: { XAF_to_EUR, XAF_to_USD, ... }
       }

PUT    /admin/settings                       → Update platform settings
       Body: Partial settings object

POST   /admin/settings/exchange-rates/refresh → Refresh exchange rates from external API
```

---

## Notifications

```
GET    /admin/notifications                  → Get admin notifications

PUT    /admin/notifications/:id/read         → Mark notification as read
       Body: {}
```

---

## Endpoint Statistics by Module

| Module         | Endpoints | GET | POST | PUT | PATCH | DELETE |
|----------------|-----------|-----|------|-----|-------|--------|
| Dashboard      | 4         | 4   | 0    | 0   | 0     | 0      |
| Auth           | 1         | 0   | 1    | 0   | 0     | 0      |
| Pros           | 6         | 2   | 1    | 1   | 1     | 1      |
| Drivers        | 6         | 2   | 1    | 1   | 1     | 1      |
| Sellers        | 6         | 2   | 1    | 1   | 1     | 1      |
| Products       | 3         | 1   | 0    | 1   | 0     | 1      |
| Transactions   | 2         | 2   | 0    | 0   | 0     | 0      |
| Disputes       | 3         | 2   | 0    | 1   | 0     | 0      |
| Users          | 2         | 0   | 0    | 0   | 2     | 0      |
| Settings       | 3         | 1   | 1    | 1   | 0     | 0      |
| Notifications  | 2         | 1   | 0    | 1   | 0     | 0      |
| **TOTAL**      | **38**    | **17** | **5** | **7** | **5** | **4** |

---

## REST Conventions Used

### HTTP Methods
- **GET** - Retrieve data (read-only)
- **POST** - Create new resources
- **PUT** - Update resources (complete replacement or specific actions like validate/resolve)
- **PATCH** - Partial update of resources
- **DELETE** - Remove resources permanently

### Response Patterns
- **List endpoints** return: `{ [entityName]: [...], total?: number }`
- **Detail endpoints** return: single entity object
- **Action endpoints** return: updated entity or `{ success: true, message: string }`

### Error Responses
- **400** - Bad request (validation errors)
- **401** - Unauthorized (missing/invalid token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not found
- **409** - Conflict (e.g., duplicate entry)
- **500** - Server error

---

## Authentication

All endpoints (except `/admin/login`) require:
- **Header:** `Authorization: Bearer <JWT_TOKEN>`
- **Guard:** `JwtAuthGuard` (NestJS)
- **Token obtained from:** `POST /admin/login`

---

## File Locations Reference

### Components Making API Calls
- `web-admin/components/dashboard/StatsCards.tsx` - Dashboard stats
- `web-admin/components/dashboard/RevenueChart.tsx` - Revenue chart
- `web-admin/components/dashboard/RecentActivity.tsx` - Recent activity
- `web-admin/components/dashboard/TransactionsTable.tsx` - Recent transactions
- `web-admin/components/layout/Header.tsx` - Notifications
- `web-admin/components/forms/ProForm.tsx` - Pro CRUD
- `web-admin/components/forms/DriverForm.tsx` - Driver CRUD
- `web-admin/components/forms/SellerForm.tsx` - Seller CRUD

### Pages Making API Calls
- `web-admin/app/pros/page.tsx` - Pros list and actions
- `web-admin/app/pros/[id]/page.tsx` - Pro detail and validation
- `web-admin/app/drivers/page.tsx` - Drivers list and actions
- `web-admin/app/drivers/[id]/page.tsx` - Driver detail and validation
- `web-admin/app/sellers/page.tsx` - Sellers list and actions
- `web-admin/app/sellers/[id]/page.tsx` - Seller detail and validation
- `web-admin/app/products/page.tsx` - Products moderation
- `web-admin/app/transactions/page.tsx` - Transactions list
- `web-admin/app/disputes/page.tsx` - Disputes list
- `web-admin/app/disputes/[id]/page.tsx` - Dispute detail and resolution
- `web-admin/app/settings/page.tsx` - Settings management

### Contexts Making API Calls
- `web-admin/contexts/SettingsContext.tsx` - Settings loading

---

## Backend Controller Mapping

| Web-Admin Route | Backend Controller | File |
|----------------|-------------------|------|
| `/admin/*` (most) | `AdminController` | `backend_checkallat/src/modules/admin/admin.controller.ts` |
| Auth endpoints | `AuthController` | `backend_checkallat/src/modules/auth/auth.controller.ts` |

**Note:** All admin operations go through the centralized `AdminController` which provides a clean separation between admin operations and client-facing API endpoints.

---

## API Client Implementation

**Location:** `web-admin/lib/api.ts`

The API client is a custom Axios-based wrapper that:
- Automatically adds JWT token to requests
- Handles request/response transformations
- Provides typed methods: `get()`, `post()`, `put()`, `patch()`, `delete()`
- Base URL configured via environment variable `NEXT_PUBLIC_API_URL`

---

**Last Updated:** 2026-03-10
