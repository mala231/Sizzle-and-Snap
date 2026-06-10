# Project Overview — Vendor Fast Food Website

## Overview

This project is a full-stack web application for a fast food vendor that sells burgers, fries, drinks, and snacks from a physical shop. The application serves two audiences: customers who can browse the menu online and place pickup orders (either as guests or registered users), and the shop owner who manages the menu, monitors incoming orders, and controls shop availability through a private admin dashboard. Customers do not pay online — they pay at the shop on arrival. The system handles operating hours automatically, showing a "Closed" banner outside of 10:00 AM to 4:00 PM, and allows the admin to manually override the shop status at any time.

---

## Goals

1. Give the shop an online presence so customers can browse the full menu with photos, descriptions, and prices before visiting.
2. Allow customers to place pickup orders online without needing to call or visit in person first.
3. Provide registered customers with a 5% discount on every order and access to their full order history.
4. Give the shop owner a private admin dashboard to manage the menu (add, edit, delete items, upload images, mark items as sold out) without touching any code.
5. Notify the shop owner of new incoming orders in real time via the admin dashboard so no order is missed.
6. Enforce operating hours automatically (open 10:00 AM – 4:00 PM) and give the owner the ability to manually close or open the shop outside those hours.
7. Build a solid, maintainable foundation that can support online payments and delivery in a future version.

---

## Core User Flow (Step by Step)

### Customer — Guest Order
1. Customer visits the website on their phone or browser.
2. If the shop is outside operating hours (before 10:00 AM or after 4:00 PM), a "Closed" banner is displayed and ordering is disabled.
3. Customer browses the menu, filtered by category (Burgers, Fries, Drinks, Snacks).
4. Items marked as "Sold Out" are displayed but cannot be added to the cart.
5. Customer adds available items to their cart and adjusts quantities.
6. Customer proceeds to checkout and selects "Order as Guest."
7. Customer enters their name and phone number.
8. Customer reviews the order summary (items, quantities, total amount).
9. Customer submits the order.
10. A confirmation screen displays the order details and instructs the customer to pay at the shop on arrival.
11. The order appears instantly in the admin dashboard marked as "Pending."

### Customer — Registered Order
1. Customer visits the website and clicks "Login" or "Register."
2. Customer creates an account with their name, email, phone number, and password, or logs in to an existing account.
3. Customer browses the menu — the cart automatically applies a 5% discount to the total.
4. Customer adds items to the cart and proceeds to checkout — name and phone are pre-filled from their account.
5. Customer reviews the discounted order total and submits the order.
6. Confirmation screen is shown and the order is saved to their account history.
7. Customer can visit their Account page at any time to view all past orders.

### Admin — Managing an Incoming Order
1. Admin opens the dashboard in a browser at the shop counter.
2. A new order arrives — the Orders section highlights it with a visual alert and notification sound.
3. Admin reviews the order: customer name, phone number, items ordered, quantities, and total.
4. Admin begins preparing the food and marks the order as "Ready."
5. Customer arrives, collects the food, and pays cash.
6. Admin marks the order as "Completed."

### Admin — Managing the Menu
1. Admin logs in to the dashboard using their email and password.
2. Admin navigates to the Menu section.
3. To add a new item: Admin fills in the item name, category, price, description, and uploads a photo. Saves the item — it appears live on the customer site immediately.
4. To edit an item: Admin clicks Edit on any item, changes any combination of text fields or the image independently, and saves. The unchanged fields remain untouched.
5. To mark an item as sold out: Admin toggles the "Sold Out" switch on the item — it becomes unorderable on the customer site immediately.
6. To delete an item: Admin clicks Delete — the item is removed from the menu and its image file is deleted from the server.

---

## Features

### Customer-Facing Site
- **Menu display** — Items grouped into 4 categories: Burgers, Fries, Drinks, Snacks
- **Item cards** — Each item shows a photo, name, short description, and price
- **Sold-out state** — Sold-out items are visibly marked and cannot be added to the cart
- **Shop status banner** — Displays "Open" or "Closed" based on operating hours or admin override
- **Cart** — Add/remove items, adjust quantities, view running total
- **Guest checkout** — Enter name and phone number to place an order without an account
- **Registered checkout** — Pre-filled details, 5% discount applied automatically
- **Order confirmation page** — Shows order summary and pickup instructions
- **User registration and login** — Email and password authentication
- **Account page** — Registered users can view their full order history

### Admin Dashboard
- **Secure login** — Email and password, protected by JWT authentication
- **Orders section** — Live list of all orders, auto-refreshed every 5 seconds, new order alerts
- **Order status controls** — Mark orders as Pending → Ready → Completed
- **Menu management** — Add, edit, and delete menu items
- **Image upload** — Upload or replace a photo for each menu item independently
- **Sold-out toggle** — Mark or unmark any item as sold out
- **Shop status control** — Manually open or close the shop regardless of operating hours
- **Operating hours settings** — View and update default open/close times (10:00 AM – 4:00 PM)

### Authentication & Access
- **Admin** — Single account, full dashboard access, JWT session
- **Registered customers** — Email + password login, order history, 5% discount
- **Guest customers** — No account required, name + phone number only
- **Route protection** — Admin routes reject all non-admin requests

---

## In Scope

- Customer-facing menu website (menu, cart, checkout, confirmation)
- Guest ordering (name + phone, no account required)
- Registered user accounts (email + password, order history, 5% discount)
- Pickup-only orders (no delivery)
- Pay at shop (no online payment processing)
- Operating hours enforcement (auto open/close at 10:00 AM / 4:00 PM)
- Manual shop open/close override in admin dashboard
- Sold-out item management
- Admin dashboard with live order feed (5-second polling)
- Order status management (Pending, Ready, Completed)
- Full menu management (add, edit, delete items)
- Image upload per menu item (stored on server filesystem)
- Single admin account (no multi-user staff access)
- PostgreSQL database for all persistent data
- React + Tailwind CSS frontend
- Express.js backend API
- Prisma ORM for database access
- Local development environment (localhost)

---

## Out of Scope

- **Online payment** — No payment gateway (Stripe, Paystack, etc.) in this version
- **Delivery** — No delivery tracking, delivery zones, or courier integration
- **Email notifications** — No emails sent to admin or customers when orders are placed
- **SMS / WhatsApp notifications** — No third-party messaging integrations
- **Multiple admin accounts** — No staff roles or permissions system
- **Discount codes or coupons** — No promo code entry at checkout
- **Loyalty points** — No points accumulation or redemption system
- **Combo meals** — No bundled item groups or meal deals
- **Real-time WebSockets** — Orders refresh via polling, not WebSocket connections
- **Cloud image storage** — Images stored locally, not on Cloudinary or S3
- **Mobile app** — Web only, no iOS or Android application
- **Production deployment** — Build targets local development; deployment is a future step

---

## Success Criteria

The application is considered complete and successful when all of the following are true:

1. A customer can visit the site, browse all menu items by category, add items to a cart, and complete a guest order by entering only their name and phone number.
2. A registered customer receives a 5% discount automatically applied to their cart total at checkout, with no manual input required.
3. A registered customer can log in and view a chronological list of all their past orders with item details and totals.
4. An item marked as "Sold Out" by the admin cannot be added to the cart by any customer (guest or registered).
5. The website displays a visible "Closed" banner and disables ordering before 10:00 AM and after 4:00 PM local time.
6. The admin can manually toggle the shop open or closed from the dashboard at any time, overriding the automatic schedule.
7. A new order placed by a customer appears in the admin dashboard within 5 seconds, with a visible alert indicating a new order has arrived.
8. The admin can mark an order through the statuses Pending → Ready → Completed from the dashboard.
9. The admin can add a new menu item with a name, category, price, description, and photo — and it appears live on the customer site immediately after saving.
10. The admin can edit the text fields of a menu item (name, price, description) without affecting the existing photo, and can replace the photo without affecting the text fields.
11. Deleting a menu item removes it from the customer site and deletes the associated image file from the server.
12. The admin dashboard is inaccessible to non-admin users — all protected routes return an unauthorized error without a valid admin JWT.
