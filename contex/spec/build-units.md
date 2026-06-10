# Build Units — Vendor Fast Food Website

Ordered by dependency. Each unit produces one visible, testable result and stays within one system boundary. Complete and verify each unit before starting the next.

Reference: `project-overview.md`, `architecture.md`, `code-standards.md`, `ai-workflow-rules.md`

---

## PHASE 1 — Foundation (Backend)

---

### Unit 1 — Backend Project Setup + Database Schema

**What it builds:**
- Initialises the `/server` Node.js project with `package.json`
- Installs all backend dependencies: `express`, `prisma`, `@prisma/client`, `bcryptjs`, `jsonwebtoken`, `multer`, `cors`, `dotenv`, `express-async-errors`
- Installs dev dependency: `nodemon`
- Configures `package.json` scripts: `"dev": "nodemon index.js"`, `"start": "node index.js"`
- Creates `.env` with `DATABASE_URL`, `JWT_SECRET`, `PORT=5000`
- Initialises Prisma: `npx prisma init`
- Writes `schema.prisma` with all 5 models: `User`, `MenuItem`, `Order`, `OrderItem`, `ShopSettings`
- Runs `npx prisma migrate dev --name init` to create the database and all tables
- Seeds one admin user account and one default `ShopSettings` row
- Creates `constants.js` with `USER_ROLES`, `ORDER_STATUS`, `CATEGORIES`, `DISCOUNT_RATE`

**Visible result:** Running `npx prisma studio` opens the database browser and shows all 5 empty tables plus the seeded admin row and shop settings row.

**Dependencies:** PostgreSQL must be installed and running locally. No other units required.

---

### Unit 2 — Express Server Skeleton + Auth Routes

**What it builds:**
- Creates `index.js` — Express app entry point with `cors`, `express.json()`, static `/uploads` file serving, and error handler mounted
- Creates `middleware/authGuard.js` — verifies JWT, attaches `req.user`, returns `401` if missing or invalid
- Creates `middleware/adminGuard.js` — checks `req.user.role === 'admin'`, returns `403` if not
- Creates `middleware/shopOpenGuard.js` — reads `ShopSettings` from DB, evaluates current time against open/close window and override flag, returns `403` if closed
- Creates `routes/auth.js` with three routes:
  - `POST /api/auth/register` — validates input, hashes password, creates `customer` user, returns JWT
  - `POST /api/auth/login` — validates credentials, returns JWT with `{ userId, role }`
  - `POST /api/auth/logout` — returns `200` (client discards token)
- Mounts `routes/auth.js` in `index.js`

**Visible result:** Server starts with `npm run dev` on port 5000 with no errors. Hitting `POST /api/auth/register` with valid JSON via Postman or curl returns a JWT token. Hitting with missing fields returns `400`.

**Dependencies:** Unit 1 must be complete (database tables and `.env` must exist).

---

### Unit 3 — Menu API (Public Read + Admin Write)

**What it builds:**
- Creates `routes/menu.js` with five routes:
  - `GET /api/menu` — public, returns all `MenuItem` rows ordered by category
  - `POST /api/menu` — admin only (`authGuard` + `adminGuard`), creates new menu item (no image yet)
  - `PUT /api/menu/:id` — admin only, updates any combination of text fields (name, description, price, category, is_available). Image field untouched unless explicitly set.
  - `DELETE /api/menu/:id` — admin only, deletes image file from `/uploads/` then deletes DB row
  - `PATCH /api/menu/:id/availability` — admin only, toggles `is_available` boolean
- Creates `routes/uploads.js` with one route:
  - `POST /api/menu/:id/image` — admin only, Multer processes the file, saves to `/server/uploads/{menuItemId}.{ext}`, updates `menu_items.image_url` with filename only
- Creates `/server/uploads/` directory
- Mounts both routes in `index.js`

**Visible result:** `GET /api/menu` returns an empty array `{ data: [] }`. `POST /api/menu` with an admin JWT creates a row visible in Prisma Studio. `DELETE /api/menu/:id` removes the row. `POST /api/menu/:id/image` saves a file to `/uploads/` and the filename appears in the DB row.

**Dependencies:** Unit 2 must be complete (auth middleware and server entry point must exist).

---

### Unit 4 — Orders API + Shop Settings API

**What it builds:**
- Creates `routes/orders.js` with four routes:
  - `POST /api/orders` — guarded by `shopOpenGuard`; accepts guest (name + phone) or registered (JWT) order; re-verifies all `is_available` flags server-side; copies `unit_price` from `menu_items.price`; applies 5% discount server-side if `req.user.role === 'customer'`; creates `Order` + `OrderItem` rows; returns `201` with order summary
  - `GET /api/orders` — admin only, returns all orders newest-first with their `order_items` and item names
  - `GET /api/orders/my` — `authGuard` only, returns orders where `user_id = req.user.userId`
  - `PATCH /api/orders/:id/status` — admin only, updates `status` to `pending | ready | completed`
- Creates `routes/settings.js` with two routes:
  - `GET /api/settings` — admin only, returns the single `ShopSettings` row
  - `PATCH /api/settings` — admin only, updates `is_open_override`, `open_time`, `close_time`
- Mounts both routes in `index.js`

**Visible result:** `POST /api/orders` with valid menu item IDs creates an order visible in Prisma Studio. Hitting it when the shop is outside 10:00–16:00 returns `403 Shop is currently closed`. A guest order has `user_id = null`. A registered order has `discount_applied = true` and a reduced `total_amount`. `PATCH /api/orders/:id/status` changes the status.

**Dependencies:** Units 1–3 must be complete (menu items must exist to reference in orders).

---

## PHASE 2 — Foundation (Frontend)

---

### Unit 5 — React Project Setup + Design System

**What it builds:**
- Scaffolds `/client` with Vite: `npm create vite@latest . -- --template react`
- Installs frontend dependencies: `react-router-dom`, `axios`, `@heroicons/react`
- Installs and configures Tailwind CSS with the full theme extension from `ui-context.md` (colors, fonts, radii, spacing, shadows)
- Adds Google Fonts import for Plus Jakarta Sans and Inter to `index.html`
- Creates `src/utils/api.js` — Axios instance with `baseURL: http://localhost:5000` and request interceptor that injects `Authorization: Bearer <token>` from `localStorage`
- Creates `src/utils/discount.js` — pure function `applyDiscount(total, isRegistered)` returning discounted total
- Creates `src/constants.js` — mirrors server `constants.js` for `CATEGORIES`, `ORDER_STATUS`
- Creates `src/context/AuthContext.jsx` — provides `user`, `token`, `login()`, `logout()` to the tree; persists token to `localStorage`
- Creates `src/context/CartContext.jsx` — provides `items`, `addItem()`, `removeItem()`, `updateQuantity()`, `clearCart()`, `total` (computed)
- Creates `src/App.jsx` — route shell with placeholder pages for all routes (no content yet, just route paths defined)
- Creates `src/main.jsx` — wraps app in `AuthContext` and `CartContext` providers

**Visible result:** `npm run dev` starts on port 5173 with no errors. The browser shows a blank page with no console errors. The Tailwind design tokens are available as classes (verify by adding a test `className="bg-primary-container text-on-primary"` div that renders red with white text).

**Dependencies:** Unit 1–4 must be complete (API must be running to confirm Axios base URL is correct). Node.js must be installed.

---

## PHASE 3 — Customer Site

---

### Unit 6 — Menu Page + Shop Status Banner

**What it builds:**
- Creates `src/hooks/useShopStatus.js` — fetches `GET /api/settings` on mount, evaluates current client time against open/close window and override, returns `{ isOpen, openTime, closeTime }`
- Creates `src/components/customer/StatusBanner.jsx` — displays a green "We're Open" or red "We're Closed — Opens at 10:00 AM" full-width banner based on `useShopStatus`
- Creates `src/components/customer/MenuCard.jsx` — displays item photo (`/uploads/{filename}`), name, description, price, category chip, sold-out overlay, and "Add to Cart" button (disabled if sold out or shop closed)
- Creates `src/pages/customer/MenuPage.jsx`:
  - Fetches `GET /api/menu` on load
  - Renders `StatusBanner` at the top
  - Renders category filter chips (All, Burgers, Fries, Drinks, Snacks)
  - Renders filtered grid of `MenuCard` components
  - Shows loading skeleton and empty state
- Wires `MenuPage` to its route in `App.jsx`

**Visible result:** Visiting `http://localhost:5173/menu` shows the status banner (open or closed based on current time) and a grid of menu cards fetched live from the API. Clicking a category chip filters the cards. Sold-out items show a greyed overlay. If the server has no items yet, an empty state message appears.

**Dependencies:** Unit 5 (frontend shell) + Units 3–4 (menu and settings API) must be running.

---

### Unit 7 — Cart Drawer + Navbar

**What it builds:**
- Creates `src/components/customer/Navbar.jsx`:
  - Logo / shop name on the left
  - Navigation links: Home, Menu
  - Cart icon with live item count badge (from `CartContext`)
  - Login / Register links (if not logged in) or user name + Logout (if logged in, from `AuthContext`)
  - Mobile: collapses to hamburger menu
- Creates `src/components/customer/CartDrawer.jsx`:
  - Slides in from the right when cart icon is clicked
  - Lists cart items with name, quantity stepper (+/−), unit price, and remove button
  - Shows subtotal; if user is registered, shows original price struck through and discounted total
  - "Checkout" button navigates to `/checkout`
  - "Continue Shopping" closes the drawer
- Integrates `CartContext` actions (`addItem`, `removeItem`, `updateQuantity`) into `MenuCard`'s "Add to Cart" button
- Mounts `Navbar` in `App.jsx` above all customer routes

**Visible result:** The navbar appears on all customer pages. Clicking "Add to Cart" on a menu card increments the cart badge. Opening the cart drawer shows the items, quantities, and total. Adjusting quantity updates the total in real time. Registered users see a discounted total.

**Dependencies:** Unit 6 (MenuCard must exist to wire up Add to Cart).

---

### Unit 8 — Guest + Registered Checkout + Order Confirmation

**What it builds:**
- Creates `src/pages/customer/CheckoutPage.jsx`:
  - Redirects to `/menu` if cart is empty
  - Shows order summary (items, quantities, totals)
  - If user is not logged in: shows "Order as Guest" form (name + phone required) and a "Login to get 5% off" prompt
  - If user is logged in: pre-fills name and phone from `AuthContext`; shows discounted total
  - Submit button calls `POST /api/orders` with cart items and customer details
  - On `403` (shop closed): shows inline "Shop is currently closed" error, does not clear cart
  - On `400` (sold-out item): shows which item is unavailable, does not clear cart
  - On `201`: clears cart, navigates to `/order-confirmation/:orderId`
- Creates `src/pages/customer/OrderConfirmationPage.jsx`:
  - Displays order ID, items ordered, total paid, and message: "Please pay at the shop when you collect your order"
  - Shows estimated wait message
  - "Back to Menu" button

**Visible result:** Adding items to cart and going to `/checkout` shows the order form. Submitting as a guest with a name and phone places an order and lands on the confirmation page with the order summary. The order appears immediately in Prisma Studio with `status: pending`.

**Dependencies:** Units 6–7 (cart and menu must be functional). Unit 4 (orders API must exist).

---

### Unit 9 — Customer Auth Pages (Register + Login) + Account Page

**What it builds:**
- Creates `src/pages/customer/RegisterPage.jsx`:
  - Form: name, email, phone, password, confirm password
  - Calls `POST /api/auth/register`, stores JWT via `AuthContext.login()`
  - On success: redirects to `/menu`
  - Shows inline validation errors
- Creates `src/pages/customer/LoginPage.jsx`:
  - Form: email, password
  - Calls `POST /api/auth/login`, stores JWT via `AuthContext.login()`
  - On success: redirects to previous page or `/menu`
  - "Don't have an account? Register" link
- Creates `src/pages/customer/AccountPage.jsx`:
  - Redirects to `/login` if not authenticated
  - Fetches `GET /api/orders/my`
  - Displays chronological list of past orders: date, items, total, status badge
  - Shows empty state if no orders yet
- Wires all three pages to their routes in `App.jsx`

**Visible result:** Visiting `/register` and submitting the form creates an account and redirects to the menu. Logging in as that user shows the name in the navbar. Visiting `/account` shows the order history (empty at first). After placing an order as a logged-in user, it appears in the order history.

**Dependencies:** Units 7–8 (navbar and checkout must exist to test the logged-in discount flow end to end). Unit 2 (auth API must exist).

---

## PHASE 4 — Admin Dashboard

---

### Unit 10 — Admin Login + Dashboard Shell + Sidebar

**What it builds:**
- Creates `src/pages/admin/AdminLoginPage.jsx`:
  - Separate login form from the customer login
  - Calls `POST /api/auth/login`, checks returned `role === 'admin'`
  - On success: stores admin JWT via `AuthContext`, redirects to `/admin/orders`
  - On non-admin login attempt: shows "Access denied — not an admin account"
- Creates `src/components/admin/Sidebar.jsx`:
  - Fixed left sidebar (280px wide on desktop)
  - Navigation links: Orders, Menu, Settings
  - Shop name and admin label at top
  - Active link highlighted
  - Collapses to icon-only on mobile
- Creates `src/pages/admin/DashboardLayout.jsx`:
  - Wraps all admin pages with `Sidebar`
  - Redirects to `/admin/login` if user is not authenticated or not admin
  - Fluid content area to the right of the sidebar
- Wires admin routes in `App.jsx` under a protected layout:
  - `/admin/login` → `AdminLoginPage`
  - `/admin/orders` → placeholder
  - `/admin/menu` → placeholder
  - `/admin/settings` → placeholder

**Visible result:** Visiting `/admin/login` shows the admin login form. Logging in with the seeded admin credentials redirects to `/admin/orders` which shows the sidebar and a blank content area. Visiting any `/admin/*` route without a valid admin JWT redirects to `/admin/login`.

**Dependencies:** Unit 5 (frontend shell and AuthContext). Unit 2 (auth API with admin role).

---

### Unit 11 — Admin Orders Section (Live Feed + Status Controls)

**What it builds:**
- Creates `src/hooks/useOrders.js`:
  - Calls `GET /api/orders` immediately on mount
  - Re-polls every 5 seconds with `setInterval`
  - Tracks `previousCount` to detect new orders
  - Returns `{ orders, loading, error, refetch }`
- Creates `src/components/admin/StatusBadge.jsx` — coloured pill for Pending (orange), Ready (green), Completed (grey)
- Creates `src/components/admin/OrderCard.jsx`:
  - Displays: order ID (truncated), customer name, phone, timestamp, item list with quantities, total amount, discount flag
  - Inline status control: three buttons (Pending / Ready / Completed), active state highlighted
  - Calls `PATCH /api/orders/:id/status` on button click, triggers `refetch`
- Creates `src/pages/admin/OrdersPage.jsx`:
  - Uses `useOrders` hook
  - When a new order arrives (count increased since last poll): plays a short audio chime and flashes a banner "New Order Received!"
  - Filter tabs: All / Pending / Ready / Completed
  - Renders list of `OrderCard` components
  - Shows empty state per filter tab
  - Shows loading state on first fetch

**Visible result:** Opening `/admin/orders` shows all existing orders in real time. Placing a new order from the customer site (in another tab) causes it to appear in the dashboard within 5 seconds with the audio alert and banner. Clicking "Ready" or "Completed" updates the status instantly and the badge changes colour.

**Dependencies:** Unit 10 (admin shell + sidebar). Unit 4 (orders API).

---

### Unit 12 — Admin Menu Manager (Add / Edit / Delete / Image Upload / Sold-Out Toggle)

**What it builds:**
- Creates `src/components/admin/MenuItemForm.jsx`:
  - Reusable form for both Add and Edit
  - Fields: name, category (dropdown), price, description, is_available toggle
  - Separate image section: shows current image preview if editing; file input to upload new image
  - Submit calls `POST /api/menu` (add) or `PUT /api/menu/:id` (edit); image is uploaded separately via `POST /api/menu/:id/image` only if a new file was selected
  - Cancel button dismisses the form without saving
- Creates `src/components/admin/ImageUploader.jsx`:
  - Drag-and-drop zone or click-to-browse file input
  - Preview of selected image before upload
  - Accepts jpg, png, webp only; max 5MB
- Creates `src/pages/admin/MenuManagerPage.jsx`:
  - Fetches `GET /api/menu` on load
  - "Add New Item" button opens `MenuItemForm` in add mode (inline or modal)
  - Lists all menu items in a table: image thumbnail, name, category, price, availability toggle, Edit button, Delete button
  - Availability toggle calls `PATCH /api/menu/:id/availability` immediately on click
  - Edit button opens `MenuItemForm` in edit mode pre-filled with item data
  - Delete button shows a confirmation dialog; on confirm calls `DELETE /api/menu/:id`; list refreshes

**Visible result:** `/admin/menu` lists all menu items in a table. Clicking "Add New Item", filling the form, and uploading an image creates a new item that immediately appears both in the admin table and on the customer `/menu` page. Toggling availability marks the item as sold out on the customer site instantly. Editing text fields saves without touching the image. Deleting removes the row and the image file from `/uploads/`.

**Dependencies:** Unit 10 (admin shell). Unit 3 (menu API including image upload route).

---

### Unit 13 — Admin Shop Settings Page

**What it builds:**
- Creates `src/pages/admin/ShopSettingsPage.jsx`:
  - Fetches `GET /api/settings` on load
  - Displays current open/close times (10:00 AM – 4:00 PM)
  - Time picker inputs to update `open_time` and `close_time`
  - Large toggle switch for `is_open_override` with label "Force shop open" / "Force shop closed"
  - Descriptive text: "When override is ON, the shop status ignores the scheduled hours above"
  - Save button calls `PATCH /api/settings`; shows success toast on save
  - Current shop status indicator: "Shop is currently OPEN / CLOSED" (evaluated live)

**Visible result:** `/admin/settings` shows the current hours and override toggle. Enabling the override and saving causes the customer site's `StatusBanner` to reflect the new state within one page refresh. Changing the hours saves to the database and is confirmed in Prisma Studio.

**Dependencies:** Unit 10 (admin shell). Unit 4 (settings API).

---

## PHASE 5 — End-to-End Polish & Verification

---

### Unit 14 — Home Page + Customer Site Navbar Mobile Menu

**What it builds:**
- Creates `src/pages/customer/HomePage.jsx`:
  - Hero section with shop name, tagline, `StatusBanner`, and "View Menu" CTA button
  - "Our Menu" section previewing one card from each of the 4 categories (fetched from API, first available item per category)
  - Footer: shop hours (10:00 AM – 4:00 PM), pickup-only notice
- Completes the mobile hamburger menu in `Navbar.jsx` (slide-down drawer with all nav links and login/logout)
- Wires `/` route to `HomePage` in `App.jsx`

**Visible result:** Visiting `http://localhost:5173` shows the full home page with hero, 4 category preview cards, and footer. On mobile (375px), the navbar collapses and the hamburger opens a slide-down menu. The status banner on the home page matches the one on the menu page.

**Dependencies:** Unit 6 (MenuCard component), Unit 7 (Navbar), Unit 4 (settings API for banner).

---

### Unit 15 — Full End-to-End Test Pass

**What it builds:**
- No new code. This unit verifies all 12 success criteria from `project-overview.md` against the running application.

**Verification checklist (must all pass):**

| # | Success Criterion | How to Test |
|---|---|---|
| 1 | Guest can browse, add to cart, and complete an order | Manual walkthrough as guest |
| 2 | Registered user gets 5% discount automatically | Register, add items, verify discounted total in cart and DB |
| 3 | Registered user sees order history on account page | Place order while logged in, visit `/account` |
| 4 | Sold-out item cannot be added to cart | Toggle item sold out in admin, attempt to add in customer site |
| 5 | Closed banner shown outside 10am–4pm | Set system clock or set override; verify banner and disabled checkout |
| 6 | Admin can manually override shop open/close | Toggle override in settings, verify banner on customer site |
| 7 | New order appears in admin dashboard within 5 seconds | Place order in one tab, watch admin orders tab |
| 8 | Admin can change order status | Click Pending → Ready → Completed on an order card |
| 9 | Admin can add a menu item with photo | Add item in admin, verify it appears on customer menu page |
| 10 | Edit text without affecting image and vice versa | Edit name only, verify image unchanged; replace image, verify name unchanged |
| 11 | Delete removes item and image file | Delete item, verify gone from menu and `/uploads/` folder |
| 12 | Admin routes reject non-admin access | Call `GET /api/orders` with a customer JWT, expect `403` |

**Visible result:** All 12 criteria pass. The application is feature-complete for v1.

**Dependencies:** All Units 1–14 must be complete.

---

## Unit Summary Table

| Unit | Name | Boundary | Depends On |
|---|---|---|---|
| 1 | Backend Setup + Database Schema | Server | PostgreSQL installed |
| 2 | Express Server Skeleton + Auth Routes | Server | Unit 1 |
| 3 | Menu API | Server | Unit 2 |
| 4 | Orders API + Shop Settings API | Server | Units 1–3 |
| 5 | React Project Setup + Design System | Client | Units 1–4 running |
| 6 | Menu Page + Shop Status Banner | Client | Unit 5, Units 3–4 |
| 7 | Cart Drawer + Navbar | Client | Unit 6 |
| 8 | Guest + Registered Checkout + Confirmation | Client | Units 6–7, Unit 4 |
| 9 | Customer Auth Pages + Account Page | Client | Units 7–8, Unit 2 |
| 10 | Admin Login + Dashboard Shell + Sidebar | Client | Unit 5, Unit 2 |
| 11 | Admin Orders Section (Live Feed) | Client | Unit 10, Unit 4 |
| 12 | Admin Menu Manager | Client | Unit 10, Unit 3 |
| 13 | Admin Shop Settings Page | Client | Unit 10, Unit 4 |
| 14 | Home Page + Mobile Navbar | Client | Units 6–7, Unit 4 |
| 15 | End-to-End Test Pass | Both | Units 1–14 |
