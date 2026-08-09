
# ScholarHub
A Community database handling team project 
..........................................

# ScholarHub — Authentication Module (Frontend Only)

A single-page authentication flow: user enters email + password to sign in;
if the backend reports the user doesn't exist, the page smoothly expands
in place into a full registration form (no route change).

## Stack
React 18 · Vite · React Router DOM · Axios · Tailwind CSS · React Hook Form · React Icons

## Setup

```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your backend
npm run dev
```

Visit `http://localhost:5173/auth`.

## Backend contract this UI expects

`POST /login` `{ email, password }`
- 200 → `{ user: { id, name, email, role }, token }` — role is `"Student"` or `"Admin"`
- 404 (or message `"User Not Found"`) → login form expands into the registration form
- 401 (or message `"Invalid Password"`) → shown as an inline alert

`POST /register` `{ fullName, email, mobileNumber, password, gender, dateOfBirth, collegeName, course, branch, currentYear, cgpaOrPercentage, category, state, annualFamilyIncome }`
- 200 → `{ user, token }`
- 409 (or message `"Email Already Exists"`) → shown as an inline alert

`POST /logout` — invalidates the session server-side (optional; the frontend
always clears its local session regardless of the response).

No backend, Firebase, Supabase, or Auth0 code is included — swap the base
URL in `.env` for your own API.
>>>>>>> Stashed changes