# Sizzle & Snap — Fast Food Vendor Web Application

A professional, full-stack web application for a fast food vendor selling burgers, fries, drinks, and snacks. The application serves both customers (who can browse the menu and place pickup orders) and the shop owner (who manages the menu, updates settings, and processes incoming orders in real time).

## Tech Stack

- **Frontend**: React.js, React Router DOM, Tailwind CSS, Axios, Vite
- **Backend**: Node.js, Express.js, Multer
- **Database / ORM**: PostgreSQL, Prisma ORM
- **Authentication**: JSON Web Tokens (JWT), bcryptjs

---

## Features

### Customer-Facing
- **Menu Browsing**: Filterable by category (Burgers, Fries, Drinks, Snacks).
- **Sold Out Status**: Items marked as sold out cannot be ordered.
- **Cart & Order System**: Easy cart management with quick pickup checkout.
- **Guest Checkout**: Place orders quickly with name and phone number.
- **Registered Accounts**: 5% discount automatically applied, plus full order history.
- **Shop Status Banner**: Dynamic banner showing whether the shop is open or closed.

### Admin Dashboard
- **Secure Dashboard**: Protected by JWT and role validation middleware.
- **Live Order Feed**: Auto-refreshed order list with status updates (Pending → Ready → Completed).
- **Menu Management**: Full CRUD capabilities, item image upload, and availability toggle.
- **Shop Status Override**: Manually open/close the shop overriding default hours.

---

## Quick Start

### 1. Installation
In the root directory, install the required packages for both the client and server:
```bash
# In the project root
npm install

# Setup server dependencies
cd server
npm install

# Setup client dependencies
cd ../client
npm install
```

### 2. Environment Variables
Create a `.env` file in the `server` directory and configure the database URL and JWT secret:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/sizzle_snap_db?schema=public"
JWT_SECRET="your_jwt_secret_key"
PORT=5000
```

### 3. Database Migration & Seeding
Set up the database schema and seed the initial admin account and sample menu:
```bash
cd server
npx prisma migrate dev --name init
node prisma/seed.js
```

### 4. Running the Application
Start the development servers for both components:
```bash
# Start backend server (runs on port 5000)
cd server
npm run dev

# Start frontend development server (runs on port 5173)
cd client
npm run dev
```
