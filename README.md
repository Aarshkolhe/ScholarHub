# ScholarHub — Smart AI-Powered Scholarship Matching Platform

ScholarHub is a full-stack academic scholarship platform designed to empower students globally by matching them with grants, fellowships, and funding opportunities tailored to their unique academic, financial, and category profiles.

---

## 🚀 Key Features & Capabilities

### 1. **Enforced 3-Page User Navigation Flow**
- **Page 1: Login / Register Page (`/` or `/login` / `/register`)**:
  - Secure entry point featuring dark mode support, pre-filled parameters, and JWT session handling.
- **Page 2: Landing Page (`/landing`)**:
  - Interactive particle physics hero canvas, cleaned trust badges ("Free to Use", "Smart Matching AI"), and prefilled saved name input with green checkmark confirmation.
- **Page 3: Dashboard (`/dashboard`)**:
  - Personalized student portal with dynamic user greeting, live scholarship matches, and profile management.

### 2. **Verification & Student Document Vault**
- **Education Details**: Course/Class, Qualification, Institution Name, Academic Stream, Semester, Marks %, and Expected Passing Year.
- **Family & Financial Details**: Annual Family Income (₹), Parent/Guardian Occupation, Income Certificate Serial Number, and Issuing Authority.
- **Category & Quota Eligibility**: Social Category (General/OBC/SC/ST/EWS), Domicile State, Minority Status, Disability Status (PwD), and Special Criteria.
- **11-Document Vault**: Upload, verify, and delete PDF/Image verification documents (Aadhaar, Income Certificate, Caste Certificate, Domicile, Marksheets, College ID, Bonafide, Bank Passbook, Disability, Photo, Previous Receipts).

### 3. **Smart Scholarship Search Engine & Application Manager**
- Real-time keyword search, category filter pills (`STEM`, `Technology`, `Engineering`, `General`, `Merit`), degree level filters, and award amount filters.
- **Interactive Application Modal**: Submit applications directly with name, course, GPA/score, and personal statement.
- **Bookmarking**: Save/unsave scholarships with live storage tracking.

### 4. **AI Assistant & Matching Studio**
- **Google Gemini AI 1.5 Flash API (100% Free)**: Live AI conversational responses via Google's official free Gemini API.
- **Built-in Local AI Engine Fallback**: Zero-cost fallback engine that works offline.
- **AI Application Essay Draft Studio**: Generate tailored 200-word Statements of Purpose / essays in 1 click.
- **AI Profile Audit & Match Score**: Real-time match rating (0-100%) and eligibility analysis.

---

## 🛠️ Technology Stack

- **Frontend**: React 18 · Vite · React Router DOM · Tailwind CSS · Lucide React · Context API
- **Backend**: Node.js · Express.js · PostgreSQL (pg) · JWT Auth · Nodemailer (Gmail SMTP)
- **AI Integration**: Google Gemini 1.5 Flash REST API (`generativelanguage.googleapis.com`) + Local Fallback Rule Engine

---

## ⚡ Quick Start & Setup

### 1. Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Visit `http://localhost:5173/` in your browser.

---

## 🔑 Environment Configuration

### Backend (`backend/.env`)
```env
PORT=5000
PG_URI=postgres://postgres:password@localhost:5432/scholarhub
JWT_SECRET=your_super_secret_jwt_key
EMAIL_USER=scholarhub34@gmail.com
EMAIL_APP_PASSWORD=your_gmail_app_password
GEMINI_API_KEY=your_free_gemini_api_key_here
```

---

## 📜 API Endpoint Summary

- `POST /login` — User authentication & session issue
- `POST /register` — User account registration
- `POST /api/ai/chat` — Google Gemini / AI Assistant Q&A response
- `POST /api/ai/essay` — AI Application Statement / Essay generator