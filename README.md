# 💎 SpendWise AI — Production-Grade AI Financial Intelligence Platform

SpendWise AI is an enterprise-ready, full-stack SaaS financial analytics and expense management platform built using the MERN stack (MongoDB, Express.js, React, Node.js), Tailwind CSS, OpenAI GPT-4 API, Cloudinary, and Recharts.

---

## 🚀 Key SaaS Features

- **🔐 Authentication & Security**: JWT Authentication with HttpOnly cookie support, bcrypt password hashing, reset password workflow (`crypto` SHA-256 tokens), rate-limiting middleware, and Helmet-equivalent security headers.
- **📊 Real-time Financial Dashboard**: Interactive analytics with Recharts graphs (Doughnut Expense pie chart, Income vs Expense bar chart, Spending Cash Flow area chart, Budget progress chart) and automated **Financial Health Score** (0–100 rating).
- **💸 Transaction Management**: Full CRUD operations with live search, advanced date/amount range filters, category filter, sorting options, and server-side pagination.
- **🎯 Automated Budgeting**: Monthly category limits with real-time progress monitoring and automated 80%, 90%, and 100% threshold alerts.
- **📷 Receipt Scanner & OCR Engine**: Drag-and-drop receipt image uploader with Cloudinary integration, OCR text field extraction, and confidence warning banners.
- **🤖 OpenAI Financial Copilot**: Natural Language Expense creation (*"Spent $45 on pizza yesterday"*), automated categorization, personalized monthly insights, budget advice, and conversational AI chatbot.
- **📄 Statements & Export Engine**: Date range preset filtering with downloadable CSV data streams and printable PDF statement generation.
- **👑 Admin Control Panel**: System analytics, user management (search, block/unblock, delete), category management, and strict role-based access control (`role === 'admin'`).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, React Router v6, Axios.
- **Backend**: Node.js, Express.js, Mongoose ODM, MongoDB Atlas.
- **AI & Storage**: OpenAI API (GPT-4o), Cloudinary Multer Storage API.
- **Deployment**: Vercel (Frontend), Render (Backend API).

---

## 📂 Project Architecture

```
SpendWise AI/
├── backend/
│   ├── config/             # DB connection
│   ├── controllers/        # REST API controllers
│   ├── middleware/         # Auth, Security, Error handling
│   ├── models/             # Production Mongoose schemas
│   ├── routes/             # Express routing specs
│   ├── services/           # Business logic layer
│   ├── validations/        # Request input validation
│   └── server.js           # Server startup script
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI & Chart components
│   │   ├── context/        # Auth & Transaction Context state
│   │   ├── layouts/        # Dashboard Master Shell Layout
│   │   ├── pages/          # Auth, Dashboard, Transactions, Budgets, AI, Admin pages
│   │   ├── services/       # Reusable Axios API wrappers
│   │   └── App.jsx         # Routing & Error Boundary
├── render.yaml             # Render backend deployment configuration
├── vercel.json             # Vercel SPA frontend proxy rewrites
└── README.md
```

---

## ⚡ Local Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB local instance or MongoDB Atlas URI

### 1. Clone & Install Dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in both `backend` and `frontend` folders:

```bash
# In /backend/.env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/spendwise_db
JWT_SECRET=your_jwt_secret_min_32_characters
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=sk-proj-your_openai_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# In /frontend/.env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Application locally
```bash
# Start backend server (runs on http://localhost:5000)
cd backend
npm run dev

# Start frontend dev server (runs on http://localhost:5173)
cd frontend
npm run dev
```

---

## 📡 Core API Endpoints

### Authentication
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Authenticate & receive JWT
- `GET /api/auth/me` — Fetch active profile
- `POST /api/auth/logout` — Revoke session cookie
- `POST /api/auth/forgot-password` — Generate reset token
- `PUT /api/auth/reset-password/:token` — Reset password

### Transactions
- `GET /api/transactions` — Fetch paginated transactions with search & range filters
- `POST /api/transactions` — Create new income/expense entry
- `PUT /api/transactions/:id` — Update transaction
- `DELETE /api/transactions/:id` — Remove transaction

### Analytics & AI
- `GET /api/analytics/dashboard` — Combined summary & chart statistics
- `POST /api/ai/chat` — Financial Chatbot Copilot
- `POST /api/ai/parse-expense` — Natural language text to transaction parser
- `POST /api/ocr/scan` — Receipt image OCR field extractor

---

## 🌐 Production Deployment Guide

### Vercel (Frontend)
1. Import the repository into Vercel.
2. Root Directory: `./` (or `frontend`).
3. Build Command: `npm run build:frontend`.
4. Output Directory: `frontend/dist`.
5. Set `VITE_API_URL` to your production backend URL.

### Render (Backend)
1. Create a Web Service on Render connected to `backend/`.
2. Environment: `Node`.
3. Build Command: `cd backend && npm install`.
4. Start Command: `cd backend && npm start`.
5. Add production Environment Variables (`MONGO_URI`, `JWT_SECRET`, `OPENAI_API_KEY`, etc.).
