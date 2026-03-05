# 🏥 Santo Cuore Salud — Medical Center Platform

<div align="center">

![Santo Cuore Salud](https://img.shields.io/badge/Santo_Cuore_Salud-Medical_Platform-CA141C?style=for-the-badge&logo=heart&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**Full-stack medical center website with AI-powered appointment booking, real-time database, and dual-theme UI system.**

[🌐 Live Demo](https://santo-cuore-salud.vercel.app) · [📖 Docs](#-project-overview) · [🚀 Features](#-features)

</div>

---

## 📋 Project Overview

**Santo Cuore Salud** is a complete institutional web platform for a private medical center specializing in vascular health, located in Córdoba, Argentina. The project delivers a premium public-facing landing page, an AI-powered appointment booking chat system with real-time database integration, and a full administrative dashboard — all in a single, production-ready deployment.

> 💡 This project was built as a complete client solution — frontend, backend, database, and deployment — with a premium clinical aesthetic and zero monthly AI API costs.

---

## ✨ Features

### 🌐 Public Landing Page (7 Sections)
- **Hero** — Animated fullscreen hero with floating gradient orbs and premium motion effects
- **Especialidades** — 4 medical departments with interactive feature cards, hover effects, and a "Virtudes y Valores" value proposition section
- **Staff** — Gallery of 16 medical professionals with photo, name, specialty, and hover animations
- **Turnos (Booking)** — Full AI-powered conversational booking system (see below)
- **Contacto** — WhatsApp, Instagram, and Google Maps embed cards
- **Acceso** — Protected admin login entry point
- **Footer** — Brand-consistent footer with institutional information

### 🤖 AI Appointment Booking Chat (Zero API Cost)
A fully deterministic conversational bot (no OpenAI, no API fees) that guides patients through a 5-step booking flow:

| Step | Action |
|------|--------|
| 1 | Select medical specialty (7 options) |
| 2 | Enter full name |
| 3 | View real-time available slots from database |
| 4 | Choose a time slot |
| 5 | Provide contact (phone/email with automatic validation) |

**Smart features:**
- ✅ `detectContactType()` — distinguishes phone (≥7 digits) vs email (@) vs invalid input
- ✅ **Anti-race condition** slot conflict checking before insert
- ✅ **"↩ Change specialty"** button to correct mistakes mid-flow
- ✅ Graceful degradation if database is temporarily unavailable
- ✅ Real-time sidebar showing booking summary with 5-step progress bar
- ✅ Contact stored with type prefix (`tel:XXXXXXXX` / `email:user@domain.com`)

### 🛡️ Admin Dashboard
Full CRUD administrative panel for managing all appointments:

- 🔐 Password-protected login
- 📊 4 real-time KPI cards (total, today, pending, confirmed)
- 📋 Full appointment table with search and status filters
- ✏️ Edit modal (patient, specialty, date, status)
- ➕ Manual appointment creation form
- 🔄 Status management (pending / confirmed / cancelled)
- 📱 Fully responsive mobile layout

### 🎨 Dual Theme System — Modo A & Modo B
A first-class light/dark theme switcher with persistent user preference:

| | **Modo A** (Dark Premium) | **Modo B** (Clinical Light) |
|---|---|---|
| Background | `#0a0a0a` dark | `#f0f4f8` light |
| Aesthetic | Glassmorphism + glow effects | Clinical white + subtle shadows |
| Cards | `backdrop-filter: blur` glass | White cards with teal accent borders |
| Palette | Teal glow + red accents | `#CA141C` red + `#008389` teal + white |
| Toggle | 🌙 Dark orb | ☀️ Light orb |
| Persistence | `localStorage` | `localStorage` |

---

## 🗄️ Database Schema

```sql
-- Neon PostgreSQL (serverless cloud)
CREATE TABLE appointments (
  id          SERIAL PRIMARY KEY,
  paciente    VARCHAR(255) NOT NULL,
  especialidad VARCHAR(100) NOT NULL,
  fecha_hora  TIMESTAMPTZ NOT NULL,
  estado      VARCHAR(50) DEFAULT 'pendiente',  -- pendiente | confirmado | cancelado
  contacto    TEXT,                              -- tel:XXXXXXXX | email:user@domain.com
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔌 API Reference

All endpoints are deployed as **Vercel Edge Functions** (sub-millisecond cold start).

### `/api/reservar` — Booking System

| Action | Description |
|--------|-------------|
| `POST { action: 'get_slots', especialidad }` | Returns 6 real-time available slots (filters already-booked times from DB) |
| `POST { action: 'create_booking', ... }` | Creates appointment with slot conflict check + typed contact storage |

### `/api/appointments` — Admin CRUD

| Method | Description |
|--------|-------------|
| `GET` | List all appointments (parses `tel:`/`email:` prefix → separate fields) |
| `POST` | Create appointment manually from admin panel |
| `PATCH` | Update appointment status only |
| `PUT` | Full appointment edit |
| `DELETE` | Remove appointment |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 18 + Vite | SPA with fast HMR |
| **Language** | TypeScript | Full type safety |
| **Routing** | React Router v6 | Client-side navigation |
| **Animation** | Framer Motion | Premium micro-animations |
| **Icons** | Lucide React | Consistent iconography |
| **Database** | Neon PostgreSQL | Serverless cloud DB |
| **API** | Vercel Edge Functions | Sub-ms serverless API |
| **Hosting** | Vercel | CDN + CI/CD from GitHub |
| **CSS** | Vanilla CSS (~1,500 lines) | Design tokens + dual theme |
| **Fonts** | Google Fonts (Inter) | Premium typography |

---

## 📁 Project Structure

```
santo-cuore-salud/
├── index.tsx              # Main SPA: Router, Navbar, all page sections
├── index.css              # Full design system, animations, Modo A/B (~1,500 lines)
├── api/
│   ├── reservar.ts        # Booking engine: slot generation + conflict check
│   ├── appointments.ts    # Admin CRUD API (GET/POST/PATCH/PUT/DELETE)
│   └── chat.ts            # Alternative chat handler (edge function)
├── app/
│   ├── reservar/
│   │   └── page.tsx       # Full conversational booking UI (480+ lines)
│   └── admin/
│       └── page.tsx       # Admin dashboard with full CRUD
└── public/
    └── staff/             # 16 professional headshots
```

---

## 🚀 Local Development

```bash
# Clone the repository
git clone https://github.com/Diegofbis63/Santo-Cuore-Salud.git
cd Santo-Cuore-Salud

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your DATABASE_URL (Neon PostgreSQL connection string)

# Run development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `POSTGRES_URL` | Alternative PostgreSQL URL (fallback) |

---

## 📊 Project Metrics

| Metric | Value |
|--------|-------|
| Sections | 7 |
| Medical professionals listed | 16 |
| Medical specialties | 7 |
| API endpoints | 6 |
| CSS lines | ~1,500 |
| TypeScript/TSX lines | ~2,500+ |
| UI themes | 2 (Dark + Light) |
| Live database | ✅ Neon PostgreSQL |
| Production deployment | ✅ Vercel |
| AI API cost | $0 (deterministic engine) |

---

## 🎯 Design Decisions

**Why no OpenAI?** The booking flow is fully deterministic — no need for an LLM. This means $0/month in API costs, predictable behavior, and instant responses.

**Why Neon + Edge Functions?** Both are serverless and cold-start near-instantly. Combined with Vercel's CDN, the TTFB is consistently under 100ms globally.

**Why vanilla CSS?** The dual-theme system requires granular control over `[data-theme]` selectors and `!important` overrides for inline styles. A CSS-in-JS approach would have added unnecessary complexity.

---

## 📄 License

This project is proprietary software developed for Santo Cuore Salud. All rights reserved.

---

<div align="center">

**Built with ❤️ by [Diego Federico Bisquerra](https://dfbportfolio.vercel.app)**

*Full-Stack Developer · Córdoba, Argentina*

</div>
