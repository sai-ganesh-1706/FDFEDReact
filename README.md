# CareerNest — Campus Placement & Recruitment Management Platform

CareerNest is an end-to-end campus placement, recruitment, and alumni networking platform designed for educational institutions, corporate recruiters, placement cells, and students. It streamlines the recruitment lifecycle from job posting, applicant tracking, assessment scheduling, and interview feedback to verified alumni referrals and placement analytics.

---

## Table of Contents

- [Overview & Architecture](#overview--architecture)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Dependencies](#dependencies)
  - [Backend Dependencies](#backend-dependencies)
  - [Frontend Dependencies](#frontend-dependencies)
- [Project Setup](#project-setup)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
- [Execution Steps](#execution-steps)
  - [Running the Backend](#running-the-backend)
  - [Running the Frontend](#running-the-frontend)
  - [Simultaneous / Concurrent Run (Windows PowerShell)](#simultaneous--concurrent-run-windows-powershell)
- [Demo Credentials](#demo-credentials)
- [Key Features by Role](#key-features-by-role)

---

## Overview & Architecture

CareerNest consists of two primary applications:
1. **NestJS Backend (`backend/backend`)**:
   - Modular architecture built with TypeScript and NestJS 11.
   - Interactive OpenAPI / Swagger documentation (`/api`).
   - Role-Based Access Control (RBAC) via custom guards and request headers (`x-role`, `x-user-id`, `x-college-id`).
   - Structured error handling and daily file-based logging (`logs/error-YYYY-MM-DD.log`).
   - Rate limiting, security headers (CSP, XSS, Frame Options), and Multer multipart file upload handling.
   - In-memory data store preloaded with mock/seed data for smooth evaluation and rapid prototyping.

2. **React + Vite Frontend (`React/React`)**:
   - Modern Single Page Application (SPA) built with React 18 and Vite.
   - Client-side routing with React Router v7.
   - Context-driven authentication state management (`AuthContext`).
   - Dedicated role portals: Candidate, Recruiter, Placement Officer, Alumni, College Admin, and Super Admin.
   - Visual dashboard analytics using Chart.js and iconography with Lucide React.

---

## Repository Structure

```text
FDFEDReact/
│
└── FDFEDReact/
    ├── backend/
    │   └── backend/                     # NestJS Backend API Service
    │       ├── src/                     # Core application modules
    │       │   ├── activity/            # System-wide audit activity logging
    │       │   ├── announcements/       # Placement announcements & circulars
    │       │   ├── applications/        # Job applications & status pipeline
    │       │   ├── assessments/         # Interview scheduling & assessments
    │       │   ├── colleges/            # College management
    │       │   ├── common/              # Filters, guards, middlewares, and loggers
    │       │   ├── contact/             # Public recruiter contact & inquiry forms
    │       │   ├── features/            # Broadcast notifications & platform features
    │       │   ├── notifications/       # User notifications
    │       │   ├── opportunities/       # Jobs & internship opportunities
    │       │   ├── recruiters/          # Recruiter verification & management
    │       │   ├── referrals/           # Candidate-to-Alumni referral workflows
    │       │   ├── super-admin/         # Super-admin controls & analytics
    │       │   ├── users/               # Authentication & user profiles
    │       │   ├── app.module.ts        # Root module
    │       │   └── main.ts              # Server bootstrap entry point
    │       ├── test/                    # End-to-end (E2E) tests
    │       │   ├── app.e2e-spec.ts      # NestJS Supertest E2E specs
    │       │   └── jest-e2e.json        # E2E Jest configuration
    │       ├── docs/                    # OpenAPI / Swagger specification
    │       │   └── swagger.json         # Swagger definitions
    │       ├── logs/                    # Generated system & error logs
    │       ├── uploads/                 # Storage for uploaded files & avatars
    │       ├── test-middlewares.ps1     # Automated middleware & security test script
    │       ├── package.json             # Backend dependencies and scripts
    │       └── tsconfig.json            # TypeScript configuration
    │
    ├── React/
    │   └── React/                       # React 18 + Vite Frontend Client
    │       ├── public/                  # Static assets
    │       ├── src/                     # Frontend source files
    │       │   ├── app/                 # AppRouter & ProtectedRoute
    │       │   ├── public-pages/        # Public landing & login pages
    │       │   ├── roles/               # Role-specific dashboard views
    │       │   │   ├── candidate/       # Student/candidate portal
    │       │   │   ├── recruiter/       # Recruiter hiring & evaluation portal
    │       │   │   ├── placement-officer/# Placement cell management portal
    │       │   │   ├── alumni/          # Alumni referral dashboard
    │       │   │   ├── college-admin/   # College administration portal
    │       │   │   └── super-admin/     # Platform super-admin portal
    │       │   ├── services/            # Axios API integration modules
    │       │   └── shared/              # Reusable UI components & AuthContext
    │       ├── .env.example             # Frontend environment template
    │       ├── index.html               # Vite HTML entry point
    │       ├── vite.config.js           # Vite build configuration
    │       └── package.json             # Frontend dependencies and scripts
    │
```

---

## Prerequisites

Before setting up the project, make sure the following tools are installed on your machine:

- **Node.js**: `v18.x` or `v20.x+` ([Download Node.js](https://nodejs.org/))
- **npm**: `v9.x` or `v10.x+` (comes bundled with Node.js)
- **PowerShell / Terminal**: Windows PowerShell 5.1+ or PowerShell Core (pwsh)
- **curl**: Standard CLI tool for testing API endpoints (preinstalled on Windows 10/11)

To verify installations, run:
```powershell
node -v
npm -v
```

---

## Dependencies

### Backend Dependencies
Key libraries used in `backend/backend`:
- `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`: Core NestJS framework.
- `@nestjs/swagger`, `swagger-ui-express`: Interactive Swagger API documentation.
- `class-validator`, `class-transformer`: Request payload validation and DTO transformations.
- `reflect-metadata`, `rxjs`: Decorator metadata and reactive streams.
- `jest`, `ts-jest`, `@nestjs/testing`: Unit and integration testing frameworks.
- `supertest`: HTTP assertions for end-to-end tests.
- `eslint`, `prettier`: Code linting and formatting.

### Frontend Dependencies
Key libraries used in `React/React`:
- `react`, `react-dom`: React 18 component runtime.
- `react-router-dom`: Client-side routing (v7).
- `axios`: Promise-based HTTP client for REST API communication.
- `lucide-react`: SVG icon library.
- `chart.js`: Dashboard charts and placement analytics visualization.
- `vite`, `@vitejs/plugin-react`: Fast development build tooling.
- `eslint`, `eslint-plugin-react-hooks`: React code quality linting.

---

## Project Setup

Clone or open the project folder in your terminal. All paths below are relative to the repository workspace root:

### 1. Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```powershell
   cd .\5_CareerNest_React\backend\backend
   ```
2. Install the required Node packages:
   ```powershell
   npm install
   ```
3. (Optional) Build TypeScript output to verify compilation:
   ```powershell
   npm run build
   ```

### 2. Frontend Setup

1. Open a second terminal and navigate to the frontend directory:
   ```powershell
   cd .\5_CareerNest_React\React\React
   ```
2. Install the required Node packages:
   ```powershell
   npm install
   ```
3. Set up the environment file:
   - Copy `.env.example` to `.env`:
     ```powershell
     Copy-Item .env.example .env
     ```
   - Verify that `.env` contains the API base URL:
     ```env
     VITE_API_BASE_URL=http://localhost:3000
     ```

---

## Execution Steps

### Running the Backend

1. In the backend directory (`5_CareerNest_React/backend/backend`):
   ```powershell
   # Development mode with hot-reloading (recommended):
   npm run start:dev

   # Or standard start:
   npm run start

   # Or production mode (after running npm run build):
   npm run start:prod
   ```
2. Once booted, you will see:
   ```text
   🚀 CareerNest API running at http://localhost:3000
   📖 Swagger docs at http://localhost:3000/api
   ```
3. Open `http://localhost:3000/api` in your browser to view and interact with the Swagger API explorer.

### Running the Frontend

1. In the frontend directory (`5_CareerNest_React/React/React`):
   ```powershell
   # Start Vite development server:
   npm run dev
   ```
2. Once started, open your browser and go to:
   ```text
   http://localhost:5173
   ```
3. For production build preview:
   ```powershell
   npm run build
   npm run preview
   ```

### Simultaneous / Concurrent Run (Windows PowerShell)

You can launch both services simultaneously from the workspace root using separate PowerShell windows:

```powershell
# In Terminal 1 (Backend):
cd .\5_CareerNest_React\backend\backend
npm run start:dev

# In Terminal 2 (Frontend):
cd .\5_CareerNest_React\React\React
npm run dev
```

Alternatively, launch both using PowerShell `Start-Process`:
```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '.\5_CareerNest_React\backend\backend'; npm run start:dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '.\5_CareerNest_React\React\React'; npm run dev"
```

---

## Demo Credentials

All test accounts come pre-configured in the in-memory database with the default password: **`123`**

| Role | Email | Password | Persona / Details |
|---|---|---|---|
| **Candidate / Student** | `c@gmail.com` | `123` | Shameer Basha Shaik (CSE, 8.7 CGPA) |
| **Recruiter** | `r@gmail.com` | `123` | Priya Kapoor (Google) |
| **Placement Officer** | `p@gmail.com` | `123` | Dr. Rajesh Nair (Placement Cell) |
| **Alumni** | `a@gmail.com` | `123` | Sneha Reddy (Software Engineer @ Google) |
| **College Admin** | `ca@gmail.com` | `123` | College Administrator |
| **Super Admin** | `sa@gmail.com` | `123` | Platform Super Administrator |

---

## Key Features by Role

- **Candidate (`/candidate/*`)**:
  - Browse verified job and internship opportunities.
  - Submit applications with resume details.
  - Request alumni referrals directly from company-matched alumni.
  - Track application pipeline stages, interview assessments, and recruiter feedback.
  - Receive real-time announcements and notifications.

- **Recruiter (`/recruiter/*`)**:
  - Post opportunities scoped to college and company.
  - Review applicant submissions with highlighted "Referred" badges.
  - Schedule interviews or assessments with virtual meeting links.
  - Filter and shortlist applicants.

- **Placement Officer (`/placement/*`)**:
  - Review, approve, and publish company job postings.
  - Verify corporate recruiters registering through the public contact form.
  - Send broadcast notifications and circulars to students and alumni.
  - Monitor college-wide placement statistics and recruiter activity.

- **Alumni (`/alumni/*`)**:
  - Dedicated referral request inbox.
  - Accept or decline referral requests with personalized guidance messages.
  - Stay updated with college placement announcements.

- **College Admin & Super Admin (`/college-admin/*`, `/super-admin/*`)**:
  - College onboarding and officer provisioning.
  - System activity logging and audit trail review.
  - Platform-wide communications.
