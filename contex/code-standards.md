# Code Standards — Vendor Fast Food Website

These standards apply to every file in both `/client` and `/server`. They exist to keep the codebase consistent, readable, and maintainable as the project grows.

---

## General

- **Keep modules small and single-purpose.** A route file handles routing. A middleware file handles one concern. A React component renders one thing. If a file is doing two unrelated jobs, split it.
- **Fix root causes, do not layer workarounds.** If a bug exists, find where the bad data or wrong assumption originates and fix it there — do not patch symptoms with `if` checks scattered across unrelated files.
- **Do not mix unrelated concerns in one component or route.** Business logic does not belong in React components — it belongs in utility functions or on the server. Presentation does not belong in API routes.
- **No commented-out code in committed files.** Dead code adds noise and confusion. Delete it. Git history exists if you need to recover it.
- **Descriptive names over short names.** `orderItems` is better than `items`. `isShopOpen` is better than `open`. Name things what they are, not what they happen to be called in the moment.
- **Fail loudly in development, fail gracefully in production.** Use `console.error` and meaningful HTTP error responses. Never swallow errors silently.

---

## JavaScript

- **No `var`.** Use `const` by default. Use `let` only when a variable must be reassigned. Never use `var`.
- **Avoid implicit type coercion.** Use strict equality (`===`) everywhere. Never use `==`.
- **Validate and sanitise all external input before using it.** Data coming from `req.body`, `req.params`, `req.query`, or any API response is untrusted until explicitly checked. Do not pass raw request data directly to Prisma or business logic.
- **Use `async/await` consistently — never mix with `.then()/.catch()` chains** in the same function. Wrap async route handlers with `express-async-errors` so unhandled promise rejections are caught automatically.
- **No magic numbers or magic strings.** Give constants a named variable. Use a `constants.js` file for values shared across modules (e.g. `DISCOUNT_RATE`, `ORDER_STATUS`, `USER_ROLES`).
- **Destructure objects and arrays where it improves clarity.** Prefer `const { name, price } = req.body` over repeated `req.body.name`, `req.body.price`.
- **Use early returns to reduce nesting.** Guard clauses at the top of a function are easier to read than deeply nested `if/else` blocks.

---

## React

- **One component per file.** Each `.jsx` file exports exactly one component. Do not define multiple components in the same file except for small, tightly scoped sub-components used only by the parent in that file.
- **Separate concerns: data fetching lives in hooks, rendering lives in components.** API calls belong in custom hooks (`/hooks/`) or utility functions (`/utils/api.js`), not directly inside component bodies.
- **Never call the backend API directly from a component.** All HTTP calls go through the shared Axios instance in `utils/api.js`. This ensures the base URL and auth headers are applied consistently.
- **Use `AuthContext` and `CartContext` for shared state — do not prop-drill more than two levels.** If a value is needed more than two components deep, move it to context.
- **Keep `useEffect` dependencies honest.** Never suppress ESLint exhaustive-deps warnings by adding `// eslint-disable-line`. Fix the dependency array correctly.
- **Loading and error states are not optional.** Every component that fetches data must handle three states: loading, error, and success. Show a meaningful UI for each.
- **Admin routes must check for admin role before rendering.** Admin dashboard pages must redirect to login if the user is not authenticated as admin — do not rely solely on server-side enforcement for UX.

---

## Express

- **Every route is registered in its own file inside `/routes/`.** `index.js` only mounts routers — it does not define route handlers inline.
- **Middleware is applied in this strict order:** `cors` → `express.json()` → static file serving → route handlers → error handler. Never apply middleware inside a route handler.
- **Admin routes must always apply `authGuard` then `adminGuard` — in that order.** Never apply `adminGuard` alone. Never apply only `authGuard` on admin routes.
- **Route handlers do not contain business logic.** A route handler calls a helper or service function, then sends a response. Validation, database queries, and computation belong in separate functions — not inline in the handler.
- **Never send a raw Prisma error to the client.** Catch database errors, log them server-side, and return a clean HTTP error response with no internal implementation details exposed.
- **Return HTTP status codes correctly.**
  - `200` — successful read or update
  - `201` — successful creation
  - `400` — invalid or missing client input
  - `401` — not authenticated
  - `403` — authenticated but not authorised
  - `404` — resource not found
  - `500` — unexpected server error

---

## Tailwind CSS

- **Do not hardcode colour values in `style` props or inline CSS.** Use Tailwind utility classes or extend the theme in `tailwind.config.js` with named colour tokens.
- **Extend the Tailwind theme for project-specific values — do not use arbitrary value syntax (`[]`) for things that repeat.** If you use a colour, size, or spacing value more than twice, define it in `tailwind.config.js`.
- **Component-level class lists that exceed 8 utilities should be extracted into a named component.** Do not write 15-class `className` strings inline — create a component instead.
- **Use responsive prefixes consistently.** Design mobile-first: write base styles for mobile, then add `sm:`, `md:`, `lg:` overrides. Never write desktop-first responsive styles.
- **Do not use Tailwind for layout logic that React state should control.** Use conditional `className` with state (e.g. `isOpen ? 'block' : 'hidden'`) only for simple toggling. Complex visibility logic should use conditional rendering (`&&` or ternary in JSX), not CSS hiding.

---

## API Routes

- **Validate request input before any logic runs.** Check that required fields exist, are the correct type, and are within acceptable ranges before calling Prisma or any other function. Return `400` immediately if validation fails.
- **Enforce authentication and ownership before any mutation.** `authGuard` and `adminGuard` run before the handler body. Inside the handler, verify ownership (e.g. `order.userId === req.user.userId`) before reading or writing user-specific data.
- **Return consistent response shapes.** All successful responses return a JSON object with a `data` key. All error responses return a JSON object with an `error` key and a human-readable `message`. Never return a raw string or a bare array as a top-level response.

  ```js
  // Success
  res.status(200).json({ data: order })

  // Error
  res.status(400).json({ error: true, message: 'Item is currently sold out.' })
  ```

- **Never trust the client for the discount calculation.** The 5% discount is applied server-side based on `req.user.role`. Any discount value sent in `req.body` is ignored entirely.
- **Re-verify menu item availability on every order submission.** Do not trust the client's claim that items are in stock. Query `menu_items.is_available` inside the order creation handler before writing to the database.

---

## Data and Storage

- **All structured data belongs in PostgreSQL.** User accounts, orders, order items, menu item metadata (name, price, description, category, availability), and shop settings are stored as rows in the database — never in flat files or environment variables.
- **Only binary/file data belongs in the filesystem.** The `/server/uploads/` directory stores menu item images only. No JSON, no text data, no generated content lives there.
- **Store only the image filename in the database, not the full path or full URL.** `menu_items.image_url` contains `abc123.jpg`, not `/server/uploads/abc123.jpg` or `http://localhost:5000/uploads/abc123.jpg`. The serving URL is constructed at the API response level.
- **Prices are stored as `DECIMAL` in the database — not as floats.** JavaScript floats are imprecise for currency. All monetary values use Prisma's `Decimal` type and are converted to strings for JSON responses.
- **Copy prices into `order_items.unit_price` at order creation time.** Never read `menu_items.price` to calculate the total of a historical order. Unit prices are immutable once an order is placed.
- **Do not store secrets in the database or in source code.** The `JWT_SECRET`, `DATABASE_URL`, and any other credentials live exclusively in the `.env` file, which is listed in `.gitignore` and never committed.

---

## File Organisation

### `/server`

- `index.js` — App entry point only. Imports Express, mounts middleware and routers, starts the server. Contains no route logic.
- `routes/` — One file per resource (`auth.js`, `menu.js`, `orders.js`, `settings.js`). Each file defines and exports a router.
- `middleware/` — One file per middleware function (`authGuard.js`, `adminGuard.js`, `shopOpenGuard.js`). Each file exports a single middleware function.
- `prisma/` — `schema.prisma` only. Migration files are auto-generated by Prisma and must not be edited manually.
- `uploads/` — Binary image files only. Named by menu item UUID. Not tracked by Git (add to `.gitignore`).
- `constants.js` — Named exports for shared literal values (`DISCOUNT_RATE`, `ORDER_STATUS`, `USER_ROLES`, `CATEGORIES`).
- `.env` — Environment variables only. Never committed to Git.

### `/client/src`

- `pages/customer/` — Full-page components for the customer-facing site. Each file maps to one URL route.
- `pages/admin/` — Full-page components for the admin dashboard. Each file maps to one admin URL route.
- `components/customer/` — Reusable UI components used across customer pages (e.g. `MenuCard`, `CartDrawer`, `StatusBanner`).
- `components/admin/` — Reusable UI components used across admin pages (e.g. `OrderCard`, `MenuItemForm`, `StatusBadge`).
- `context/` — React context providers only (`AuthContext.jsx`, `CartContext.jsx`). No business logic — context stores and exposes state.
- `hooks/` — Custom React hooks that encapsulate data-fetching or side-effect logic (e.g. `useOrders.js`, `useShopStatus.js`).
- `utils/` — Pure utility functions and the shared Axios instance (`api.js`, `discount.js`). No JSX. No side effects.

---

## Git Hygiene

- **Commit messages follow this format:** `type: short description` — e.g. `feat: add sold-out toggle to menu item`, `fix: apply discount server-side`, `chore: add nodemon script`.
- **Valid types:** `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `test`.
- **Never commit:** `.env`, `node_modules/`, `/server/uploads/`, build output (`/client/dist/`). All of these must be listed in `.gitignore` at project root.
- **One logical change per commit.** Do not bundle an unrelated bug fix with a new feature in the same commit.
