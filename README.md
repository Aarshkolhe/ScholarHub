# ScholarHub — Smart AI-Powered Scholarship Matching Platform

ScholarHub is a full-stack academic scholarship platform designed to empower students across India by matching them with official government schemes, state quotas, corporate CSR grants, and merit fellowships tailored to their unique academic, financial, and category profiles.

---

## 🚀 Key Features & Capabilities

### 1. **Official Portal Integration & Database Persistence**
- **MahaDBT Portal** (`mahadbt.maharashtra.gov.in`): Rajarshi Chhatrapati Shahu Maharaj EBC Fee Reimbursement (₹60,000/yr), Dr. Punjabrao Deshmukh Hostel Allowance (₹30,000/yr), Post-Matric OBC/VJNT/SBC & SC/ST Schemes.
- **MahaJYOTI Portal** (`mahajyoti.org.in`): MPhil & PhD Research Fellowship (₹31,000/mo), Foreign Higher Education Overseas Grant (₹20 Lakhs/yr), Civil Services (UPSC/MPSC) Coaching Assistance.
- **Vidyasaarathi Portal** (`vidyasaarathi.co.in`): Corporate CSR Grants (ACC Engineering Grant, JSW Udaan, TransUnion CIBIL Female STEM, Nuvoco Shiksha Bharat Grant).
- **National Scholarship Portal (NSP)**: Central Sector CSSS & National Means-cum-Merit School Grants.

### 2. **Class 10th, 12th & Higher Education Support**
- Dedicated school scholarships for **Class 10th & 12th students** (10th Board Passed Merit Grants, MHT-CET/JEE/NEET Free Coaching & Tab Allowance, Vidyasaarathi Post-10th Grants, NMMSS School Grants).
- Complete support for **Undergraduate (B.Tech / B.Sc / MBBS)**, **Postgraduate (M.Tech / M.Sc / MD)**, and **Doctorate (PhD / MPhil)** scholars.

### 3. **Search Scholarships & Multi-Criterion Filter Toolbar**
- **Filter 1: Class / Graduation Level** (Class 10th/12th, Undergraduate, Postgraduate, Doctorate).
- **Filter 2: Discipline / Stream** (Medical & Healthcare, Engineering & Tech, STEM, Arts & Commerce).
- **Filter 3: Funding Provider Type** (Official Govt Schemes, Private CSR Grants).
- **Instant Portal Pills**: Click `All Portals`, `🏛️ MahaDBT Portal`, `🏛️ MahaJYOTI Portal`, or `🏢 Vidyasaarathi Portal` to filter source portals instantly.
- **Action Search Button & Keyword Bar**: Integrated keyword search bar with a prominent **"Search Scholarships"** button.

### 4. **Google Gemini AI Integration (100% Free API)**
- Resilient multi-model fallback pipeline (`gemini-3.6-flash`, `gemini-3.5-flash-lite`, `gemini-3.5-flash`, `gemini-3.7-flash`).
- Live student profile context integration (Course, Marks %, Family Income, Category, Domicile State) feeding directly into AI prompts.

### 5. **Full PostgreSQL Database Persistence**
- Stores users, student profiles, uploaded document metadata, scholarships, saved bookmarks, and submitted applications permanently in PostgreSQL (`scholarhub` database).

---

## 🛠️ Technology Stack

- **Frontend**: React 18 · Vite · React Router DOM · Tailwind CSS · Lucide React · Context API
- **Backend**: Node.js · Express.js · PostgreSQL (pg) · JWT Auth · Nodemailer (Gmail SMTP)
- **AI Integration**: Google Gemini REST API (`generativelanguage.googleapis.com`) + Resilient Model Fallback Pipeline

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

- `POST /register` — User account registration
- `POST /login` — User authentication & session issue
- `GET /api/scholarships` — Fetch all portal scholarships from PostgreSQL
- `POST /api/scholarships/apply` — Submit scholarship application to PostgreSQL
- `POST /api/scholarships/bookmark` — Bookmark scholarship in PostgreSQL
- `POST /api/profile` — Save student profile details to PostgreSQL
- `GET /api/profile` — Retrieve student profile details from PostgreSQL
- `POST /api/ai/chat` — Google Gemini AI Assistant Q&A response
- `POST /api/ai/essay` — Google Gemini AI Statement of Purpose generator