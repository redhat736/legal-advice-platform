# ⚖️ Legal Advice - Enterprise Full-Stack Application

A modern, responsive, production-ready legal consultation and case management web application built using **React.js, Tailwind CSS, Node.js, Express.js, and an SQL Database**.

---

## 📁 Architecture Overview

```
legal-advice-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # SQL connection pool + embedded resilient fallback
│   │   │   └── security.js           # CORS, Helmet, Cookie, and JWT config
│   │   ├── controllers/
│   │   │   ├── authController.js     # Register, Login, Logout, Session check
│   │   │   ├── caseController.js     # 6 Law categories & Case management
│   │   │   ├── docController.js      # Secure upload, listing, authorized download (BOLA-safe)
│   │   │   ├── agentController.js    # Lawyer directory, profile management
│   │   │   └── chatController.js     # Client-lawyer sessions & real-time messaging
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js     # JWT verification via HttpOnly cookies & RBAC guard
│   │   │   ├── rateLimiter.js        # Global & strict auth route rate limiters
│   │   │   ├── uploadMiddleware.js   # Multer config (MIME filter, 5MB limit, UUID names)
│   │   │   └── validator.js          # Zod request payload schema validation
│   │   ├── models/
│   │   │   └── schema.sql            # Complete SQL DDL schema + initial seed data
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── caseRoutes.js
│   │   │   ├── docRoutes.js
│   │   │   ├── agentRoutes.js
│   │   │   └── chatRoutes.js
│   │   └── app.js                    # Express setup, middleware pipeline & server entry
│   ├── uploads/                      # Secured local storage for uploaded case files
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── assets/logo.svg           # Clean SVG Legal Scale Logo
    ├── src/
    │   ├── api/
    │   │   └── client.js             # Axios instance with withCredentials: true
    │   ├── components/
    │   │   ├── Navbar.jsx            # Role-aware responsive navigation bar
    │   │   ├── Footer.jsx
    │   │   ├── ProtectedRoute.jsx    # Auth & Role guard ('client' vs 'lawyer')
    │   │   ├── Modal.jsx             # Accessible modal dialog
    │   │   └── AuthModal.jsx         # Sign in / Register with 1-click Demo logins
    │   ├── context/
    │   │   └── AuthContext.jsx       # Global user session & role state provider
    │   ├── pages/
    │   │   ├── LandingPage.jsx       # 1️⃣ Hero section, brand logo, & "Get Started" CTA
    │   │   ├── Dashboard.jsx         # Role-based switch: Client Dashboard vs Lawyer Dashboard
    │   │   ├── LegalCases.jsx        # 2️⃣ 6 Law categories + interactive detail + Case filing
    │   │   ├── MyDocuments.jsx       # 3️⃣ Drag-and-drop file upload & secure document viewer
    │   │   ├── PersonalAgents.jsx    # 4️⃣ Verified lawyer directory with filter & "Chat Now" CTA
    │   │   ├── Chat.jsx              # 5️⃣ Real-time / DB-backed messaging interface with timestamps
    │   │   └── Settings.jsx          # 6️⃣ Profile settings, About Us, Contact, Privacy, Help
    │   ├── App.jsx                   # React Router v6 setup with page transitions
    │   ├── main.jsx
    │   └── index.css                 # Tailwind CSS imports & custom theme variables
    ├── index.html
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## ⚡ Quick Start Guide

### 1. Start the Backend API
```bash
cd legal-advice-app/backend
npm install
npm run dev
```
Backend will start on `http://localhost:5000`.

*Note: The backend connects to PostgreSQL if `DATABASE_URL` is set in `.env`. If PostgreSQL is not active locally, it automatically falls back to the embedded SQL engine with seed data.*

### 2. Start the Frontend React Client
```bash
cd legal-advice-app/frontend
npm install
npm run dev
```
Frontend will start on `http://localhost:5173`.

---

## 🔑 Pre-Seeded Demo Credentials

Inside the Sign In modal, you can click the **1-Click Demo Access** buttons:

| Role | Email | Password |
|---|---|---|
| **Client** | `client@example.com` | `LegalPass123!` |
| **Lawyer (Corporate)** | `marcus.vance@legaladvice.com` | `LegalPass123!` |
| **Lawyer (Criminal)** | `elena.rostova@legaladvice.com` | `LegalPass123!` |
| **Lawyer (Family)** | `sarah.chen@legaladvice.com` | `LegalPass123!` |

---

## 🛡️ Security & Defense-in-Depth Controls
1. **HttpOnly Cookie Authentication:** JWT tokens are stored solely in `HttpOnly`, `SameSite=Strict` cookies to block XSS token exfiltration.
2. **BOLA/IDOR Prevention:** All documents (`GET /api/documents/:id/download`) and chat histories (`GET /api/chat/sessions/:id/messages`) strictly verify user ownership or attorney assignment in SQL queries.
3. **100% Parameterized SQL:** All SQL queries use parameter substitution (`$1, $2, ...`) with zero string concatenation.
4. **MIME-Type & File Size Hardening:** Uploads are limited to `application/pdf`, `image/jpeg`, `image/png`, capped at 5MB, and stored with sanitized UUID filenames.
5. **Rate Limiting & Helmet:** Hardened with `express-rate-limit` (brute-force defense) and `helmet` security headers.
