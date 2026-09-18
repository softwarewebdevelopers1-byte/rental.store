# Hostel Rental Management System — Frontend

## Project overview
A role-based frontend for a hostel rental platform: students discover hostels,
apply to live there, pay rent, chat with landlords/caretakers, raise maintenance
requests, and buy hostel essentials from a marketplace. Landlords manage multiple
hostels, rooms, tenants, payments, and caretakers. Admins moderate the entire
platform. A market-agent role manages products, packs, orders, and conflicts.

The backend does **not** exist yet. All data is mocked through a service layer
that can be replaced with real HTTP calls without touching components.

## Tech stack
- React 18 + TypeScript (strict)
- Vite
- React Router v6
- CSS Modules
- No state library — React Context + hooks

## Installation
```bash
npm install
npm run dev
```

## Project structure
See `PROJECT_STRUCTURE.md`.

## Roles
| Role | Purpose |
|---|---|
| `STUDENT` | Tenant; hostel discovery, payments, messaging, marketplace |
| `LANDLORD` | Owns hostels; manages rooms, tenants, requests, caretakers |
| `CARETAKER` | Assigned to hostels; handles maintenance and student chats |
| `MARKET_AGENT` | Manages products, packs, orders, conflicts |
| `ADMIN` | Platform-wide moderation |

## Demo accounts
All demo passwords are `password`.

| Role | Email |
|---|---|
| Student | student@example.com |
| Landlord | landlord@example.com |
| Caretaker | caretaker@example.com |
| Market Agent | agent@example.com |
| Admin | admin@example.com |

The login page also exposes one-click demo sign-in buttons per role.

## Mock data
Located in `src/data/*.ts`. Each module exports typed arrays. Components never
import from `src/data/` directly — they call services.

## Mock services
Located in `src/services/*.ts`. Each service exposes async methods
(`list`, `getById`, `create`, `update`, `remove`, plus domain methods) that
return Promises resolving from the mock data. Artificial 200–400 ms delay
simulates network.

## Routing
See `PROJECT_STRUCTURE.md` for the full route table.

## Authentication
Mock-only. `authService.login` checks email against `mockUsers` and accepts
`password` for any user. Session is stored in `localStorage` under
`auth.session` via `AuthProvider`. `RoleRoute` enforces role access.

Student registration validates `hostelCode` through
`authService.validateHostelCode(code)` which checks the code against the mock
hostels. Create Account is disabled until the code resolves to a real hostel.
After registration, `membershipStatus` is `PENDING` and the user is redirected
to `/pending-approval`.

## Future backend integration
Each service method currently returns mock data. To connect a Spring Boot
backend:

1. Set `VITE_API_BASE_URL` in `.env`.
2. Implement `apiClient` in `src/services/apiClient.ts` using `fetch` or `axios`.
3. Replace each service method body with the corresponding HTTP call, e.g.:

```ts
async list(filters: HostelFilters) {
  return apiClient!.get<HostelSummary[]>("/hostels?" + toQuery(filters));
}
```

No component, hook, context, or page changes are required. The service layer
is the sole seam between the UI and the network.

## What is intentionally NOT implemented
- Real authentication (JWT handling, refresh tokens)
- Real payment provider
- Real SMS / email
- WebSocket real-time chat (the message layer is structured for later addition)
- File uploads (attachments are simulated with placeholder URLs)
