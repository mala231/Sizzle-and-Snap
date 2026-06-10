# Architecture — Vendor Fast Food Website

---

## Stack Table

| Layer | Technology | Version | Role |
|---|---|---|---|
| **Frontend Framework** | React.js | 18.x | Component-based UI for customer site and admin dashboard |
| **Frontend Build Tool** | Vite | 5.x | Dev server with hot module replacement, production bundler |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS framework for consistent, responsive design |
| **Client Routing** | React Router DOM | 6.x | Client-side page routing (customer site + admin dashboard) |
| **HTTP Client** | Axios | 1.x | Makes API requests from React to Express; handles auth headers |
| **Backend Framework** | Express.js | 4.x | REST API server; handles all business logic and route protection |
| **Runtime** | Node.js | 20.x | JavaScript runtime for the Express server |
| **ORM** | Prisma | 5.x | Type-safe database access; manages schema and migrations |
| **Database** | PostgreSQL | 15.x | Relational database; stores all persistent application data |
| **Password Hashing** | bcryptjs | 2.x | Hashes and verifies user passwords before storage |
| **Authentication** | JSON Web Tokens (JWT) | 9.x | Stateless auth tokens issued on login, verified on protected routes |
| **File Uploads** | Multer | 1.x | Parses multipart/form-data; saves uploaded images to disk |
| **Cross-Origin** | CORS | 2.x | Allows the React dev server (port 5173) to call Express (port 5000) |
| **Environment Config** | dotenv | 16.x | Loads `.env` variables (DB URL, JWT secret, port) into `process.env` |
| **Dev Server (backend)** | nodemon | 3.x | Restarts Express automatically on file changes during development |

---

## System Boundaries

The project is split into two top-level directories. Each owns a distinct responsibility and neither should reach into the other's internals.

```
/vendor
  /client          ← React frontend (browser)
  /server          ← Express backend (Node.js)
  project-overview.md
  architecture.md
```

### `/client` — Frontend Boundary

Owns everything the browser renders and the user interacts with. Makes HTTP requests to the backend API and renders responses. Never reads from the database directly. Never touches the filesystem.

```
/client
  /src
    /pages
      /customer         ← Home, Menu, Cart, Checkout, Confirmation, Login, Register, Account
      /admin            ← AdminLogin, Dashboard, Orders, MenuManager, ShopSettings
    /components
      /customer         ← Navbar, MenuCard, CartDrawer, OrderSummary, StatusBanner
      /admin            ← Sidebar, OrderCard, MenuItemForm, ImageUploader, StatusBadge
    /context
      AuthContext.jsx   ← Stores logged-in user state and JWT token (customer + admin)
      CartContext.jsx   ← Stores cart items, quantities, and computed totals
    /hooks
      useOrders.js      ← Polls /api/orders every 5 seconds for the admin dashboard
      useShopStatus.js  ← Fetches shop open/closed state on page load
    /utils
      api.js            ← Axios instance with base URL and auth header injection
      discount.js       ← Applies 5% discount for registered users
    main.jsx            ← App entry point
    App.jsx             ← Route definitions
  index.html
  tailwind.config.js
  vite.config.js
```

### `/server` — Backend Boundary

Owns all business logic, data access, authentication enforcement, and file storage. The frontend is a client of the backend API — it has no knowledge of the database schema or server filesystem paths.

```
/server
  /routes
    auth.js           ← POST /api/auth/register, /login, /logout
    menu.js           ← GET /api/menu, POST, PUT, DELETE /api/menu/:id (admin only)
    orders.js         ← POST /api/orders, GET /api/orders, PATCH /api/orders/:id/status
    settings.js       ← GET /api/settings, PATCH /api/settings (admin only)
    uploads.js        ← POST /api/menu/:id/image (admin only, handled by Multer)
  /middleware
    authGuard.js      ← Verifies JWT; attaches user to req.user; rejects unauthenticated
    adminGuard.js     ← Checks req.user.role === 'admin'; rejects non-admins
    shopOpenGuard.js  ← Blocks POST /api/orders if shop is currently closed
  /prisma
    schema.prisma     ← Single source of truth for all database models
    /migrations       ← Auto-generated SQL migration files from Prisma
  /uploads            ← Uploaded menu item images stored as flat files (e.g. item-uuid.jpg)
  index.js            ← Express app entry point; mounts routes and middleware
  .env                ← DATABASE_URL, JWT_SECRET, PORT (never committed to git)
  package.json
```

---

## Storage Model

### PostgreSQL (Relational Database)

All structured, relational, and transactional data lives in PostgreSQL and is accessed exclusively through Prisma.

| Table | What It Stores |
|---|---|
| `users` | All accounts: admin and customers. Stores hashed passwords, email, name, phone, role |
| `menu_items` | All menu items: name, description, price, category, image filename, availability flag |
| `orders` | Each order: customer info (or user FK for registered), status, total, discount flag, timestamp |
| `order_items` | Line items per order: FK to order, FK to menu item, quantity, unit price at time of order |
| `shop_settings` | Single row: manual open/close override boolean, default open time, default close time |

**Key rule:** Unit price is copied from `menu_items.price` into `order_items.unit_price` at the moment the order is placed. A subsequent price change on the menu item must not alter historical order totals.

### File Storage (Server Filesystem)

Only menu item images are stored as files. All other data is in PostgreSQL.

| Path | Content | Naming Convention |
|---|---|---|
| `/server/uploads/` | Menu item photos uploaded by admin | `{menu_item_id}.{ext}` (e.g. `abc123.jpg`) |

Images are served statically by Express at `/uploads/{filename}` and the `menu_items.image_url` column stores only the filename (not the full path), so the serving URL can change without a database migration.

When a menu item is deleted, the associated file in `/server/uploads/` is deleted from disk before the database row is removed.

### Cache / Session State

There is no server-side cache or session store in v1. Authentication is fully stateless using JWT. Client-side state (cart, logged-in user) is held in React Context and is lost on page refresh for unauthenticated sessions.

| State | Where It Lives |
|---|---|
| Cart contents | React Context (`CartContext`) — in-memory, browser only |
| Logged-in user + JWT | React Context (`AuthContext`) + `localStorage` (persisted across refresh) |
| Admin JWT | React Context (`AuthContext`) + `localStorage` |
| Shop open/closed status | Fetched from PostgreSQL (`shop_settings`) on demand; not cached |
| Incoming orders (admin) | Polled from PostgreSQL every 5 seconds; held in component state |

---

## Auth and Access Model

### Authentication Flow

1. User submits email + password to `POST /api/auth/login`.
2. Express looks up the user by email in `users` table.
3. `bcryptjs.compare()` checks the submitted password against the stored hash.
4. On success, Express signs a JWT containing `{ userId, role }` with `JWT_SECRET` and returns it.
5. The client stores the JWT in `localStorage` and attaches it to every subsequent request as `Authorization: Bearer <token>`.
6. On protected routes, `authGuard` middleware verifies the token signature and expiry, then attaches the decoded payload to `req.user`.

### Role Model

| Role | How Assigned | What They Can Do |
|---|---|---|
| `admin` | Manually seeded in database at setup | Access all admin dashboard routes, manage menu, manage orders, change settings |
| `customer` | Set automatically on `POST /api/auth/register` | Place orders, view own order history, receive 5% discount |
| `guest` | No account — no JWT | Place orders with name + phone only; no order history |

### Route Protection Matrix

| Route | Method | Guard | Who Can Access |
|---|---|---|---|
| `/api/menu` | GET | None | Public (anyone) |
| `/api/orders` | POST | `shopOpenGuard` | Anyone (guest or registered) |
| `/api/orders/my` | GET | `authGuard` | Registered customers only |
| `/api/orders` | GET | `authGuard` + `adminGuard` | Admin only |
| `/api/orders/:id/status` | PATCH | `authGuard` + `adminGuard` | Admin only |
| `/api/menu` | POST | `authGuard` + `adminGuard` | Admin only |
| `/api/menu/:id` | PUT | `authGuard` + `adminGuard` | Admin only |
| `/api/menu/:id` | DELETE | `authGuard` + `adminGuard` | Admin only |
| `/api/menu/:id/image` | POST | `authGuard` + `adminGuard` | Admin only |
| `/api/settings` | GET | `authGuard` + `adminGuard` | Admin only |
| `/api/settings` | PATCH | `authGuard` + `adminGuard` | Admin only |

### Ownership Rules

- A registered customer can only retrieve **their own orders** (`orders.user_id = req.user.userId`). They cannot access other users' orders.
- The admin can retrieve **all orders** regardless of user.
- Guest orders have `user_id = NULL` and are visible only to the admin.

---

## Background Tasks

There are no server-side background tasks or job queues in v1. All time-based and polling logic runs on the client.

| Task | Where It Runs | Mechanism |
|---|---|---|
| Poll for new orders | Admin browser (React) | `setInterval` every 5 seconds calling `GET /api/orders?status=pending` |
| Shop open/close enforcement | Server (`shopOpenGuard` middleware) | Evaluated on every `POST /api/orders` request against current time and `shop_settings` |
| Auto "Closed" banner | Customer browser (React) | `useShopStatus` hook fetches `GET /api/settings` on page load and evaluates current time client-side |

No AI models, machine learning, or third-party AI services are used in this project.

---

## Invariants

These are rules the codebase must never violate under any circumstances. Violating any of these rules is a bug, not a design decision.

---

**Invariant 1 — Passwords are never stored in plaintext.**
The `users.password_hash` column must always contain a bcrypt hash. The raw password string must be hashed with `bcryptjs.hash()` before any `INSERT` or `UPDATE` to the `users` table. No route, script, or seed file may write a plaintext string into `password_hash`.

---

**Invariant 2 — Historical order prices are immutable.**
When an order is placed, the price of each item is copied from `menu_items.price` into `order_items.unit_price` at that moment. Subsequent edits to `menu_items.price` must never update `order_items.unit_price`. Order totals are always calculated from `order_items.unit_price`, never from the current `menu_items.price`.

---

**Invariant 3 — Orders cannot be placed when the shop is closed.**
Every `POST /api/orders` request must pass through `shopOpenGuard` before reaching the order creation logic. The guard checks the current server time against `shop_settings.open_time`, `shop_settings.close_time`, and `shop_settings.is_open_override`. If the shop is closed, the request must be rejected with HTTP `403` before any database write occurs.

---

**Invariant 4 — The 5% discount is calculated and validated server-side.**
The discount must be applied by the server when creating the order, not trusted from the client. The server reads `req.user.role` from the verified JWT to determine if a discount applies. Any discount amount submitted by the client in the request body must be ignored. Guest orders always receive `discount_applied = false`.

---

**Invariant 5 — Admin routes are protected by both `authGuard` and `adminGuard`.**
No route that reads, writes, or deletes admin-only data (orders list, menu mutations, settings, image uploads) may be registered without both middleware functions applied in order: `authGuard` first, then `adminGuard`. Applying only `authGuard` is insufficient — it would allow any registered customer to access admin endpoints.

---

**Invariant 6 — Deleting a menu item must delete its image file.**
When a `DELETE /api/menu/:id` request is processed, the server must delete the corresponding file from `/server/uploads/` before or within the same operation as removing the database row. Orphaned image files (files with no corresponding database row) are a storage leak and must not accumulate.

---

**Invariant 7 — Sold-out items cannot be ordered.**
When processing `POST /api/orders`, the server must re-verify that every `menu_item_id` in the request has `is_available = true` in the database at the time of the request. Client-side sold-out blocking is a UX convenience only. If any item in the order is unavailable, the entire request must be rejected with HTTP `400` and a descriptive error message.
