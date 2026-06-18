# FreshMart — Online Grocery Store

Full-stack grocery delivery platform for Sahiwal, Pakistan.
Built with React 19 (frontend) and Node.js / Express 5 / MongoDB Atlas (backend).

---

## Project Structure

```
freshmart/
├── backend/          Node.js + Express API
│   ├── config/       DB connection, Cloudinary setup
│   ├── controllers/  Business logic (one file per resource)
│   ├── middleware/   auth (protect, requireAdmin), validation
│   ├── models/       Mongoose schemas
│   └── routes/       Thin route declarations
└── frontend/         React SPA
    ├── src/
    │   ├── api/      Axios instance + interceptors
    │   ├── components/
    │   │   ├── admin/   AdminGuard, AdminLayout
    │   │   └── common/  Navbar, Footer, ProductCard, StripePaymentForm
    │   ├── context/  AuthContext
    │   ├── hooks/    useProducts, useCategories, useOrders
    │   ├── pages/
    │   │   ├── admin/    Dashboard, Products, Orders, Categories, Reviews
    │   │   └── customer/ Home, Products, ProductDetail, Cart, Checkout,
    │   │                  OrderTracking, Profile, Login, Register
    │   └── utils/    image.js (Cloudinary URL optimizer)
    └── public/
```

---

## Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | React 19, React Router 7, Axios, Tailwind CSS |
| Payments  | Stripe React SDK |
| Backend   | Node.js, Express 5 |
| Database  | MongoDB Atlas + Mongoose 9 |
| Images    | Cloudinary |
| Security  | JWT, helmet, express-rate-limit |

---


## Running Locally

```bash
# 1. Install backend dependencies
cd backend && npm install

# 2. Install frontend dependencies
cd ../frontend && npm install

# 3. Start backend (from /backend)
npm run dev        # uses nodemon — restarts on file changes

# 4. Start frontend (from /frontend)
npm start          # opens http://localhost:3000
```

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Customer registration |
| POST | `/api/auth/login` | — | Phone-only login |
| GET | `/api/auth/profile` | Customer | Get own profile |
| PUT | `/api/auth/profile` | Customer | Update name/email |
| POST | `/api/auth/admin-login` | — | Admin panel login |
| GET | `/api/products` | — | List products (filterable) |
| GET | `/api/products/:id` | — | Single product |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Soft-delete product |
| GET | `/api/categories` | — | List categories |
| POST | `/api/categories` | Admin | Create category |
| PUT | `/api/categories/:id` | Admin | Update category |
| DELETE | `/api/categories/:id` | Admin | Soft-delete category |
| GET | `/api/orders` | Admin | All orders |
| GET | `/api/orders/stats` | Admin | Dashboard stats |
| GET | `/api/orders/user/:userId` | Customer (own) | User's orders |
| POST | `/api/orders` | Customer | Place order |
| PUT | `/api/orders/:id/status` | Admin | Update order status |
| GET | `/api/reviews/product/:id` | — | Product reviews |
| GET | `/api/reviews/can-review/:id` | Customer | Review eligibility |
| POST | `/api/reviews` | Customer | Submit review |
| GET | `/api/reviews/admin/all` | Admin | All reviews |
| PUT | `/api/reviews/:id/toggle` | Admin | Show/hide review |
| DELETE | `/api/reviews/:id` | Admin | Delete review |
| POST | `/api/upload/product` | Admin | Upload product image |
| POST | `/api/upload/profile` | Customer | Upload profile photo |
| POST | `/api/payment/create-intent` | Customer | Create Stripe intent |
| POST | `/api/payment/confirm` | Customer | Confirm payment |
| POST | `/api/payment/webhook` | Stripe | Webhook handler |

---

## Admin Panel

Navigate to `http://localhost:3000/admin/login`.

Login requires:
- A registered phone number in the database
- The `ADMIN_SECRET` value from `backend/.env`

The first login marks that phone number's account as `isAdmin: true`.

---

