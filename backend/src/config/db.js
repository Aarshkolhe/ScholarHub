import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "scholarhub",
  user: String(process.env.DB_USER || "postgres"),
  password: String(process.env.DB_PASSWORD || ""),
  max: Number(process.env.DB_POOL_MAX || 20),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
});

// --------------------------------------------------
// Test Database Connection
// --------------------------------------------------

export async function testDatabaseConnection() {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
    console.log("PostgreSQL connected successfully.");
  } finally {
    client.release();
  }
}

// --------------------------------------------------
// Initialize & Seed Database with 10th, 12th, Degree & Higher Education Schemes
// --------------------------------------------------

export async function initializeDatabase() {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    -- Users Table
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(120) NOT NULL,
      email VARCHAR(320) NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'Student' CHECK (role IN ('Student', 'Admin')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx ON users (LOWER(email));

    -- Student Profiles Table
    CREATE TABLE IF NOT EXISTS student_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      current_course TEXT,
      qualification TEXT,
      college_name TEXT,
      year_semester TEXT,
      marks_percentage TEXT,
      passing_year TEXT,
      stream_branch TEXT,
      tenth_percentage TEXT,
      twelfth_percentage TEXT,
      living_type VARCHAR(50) DEFAULT 'Day Scholar at Home',
      monthly_living_cost NUMERIC,
      annual_income NUMERIC,
      guardian_occupation TEXT,
      income_cert_no TEXT,
      income_issuing_auth TEXT,
      category VARCHAR(50),
      domicile_state VARCHAR(100),
      is_minority VARCHAR(10) DEFAULT 'No',
      is_disability VARCHAR(10) DEFAULT 'No',
      special_criteria TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS tenth_percentage TEXT;
    ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS twelfth_percentage TEXT;
    ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS living_type VARCHAR(50) DEFAULT 'Day Scholar at Home';
    ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS monthly_living_cost NUMERIC;

    -- Student Documents Table
    CREATE TABLE IF NOT EXISTS student_documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      doc_type VARCHAR(50) NOT NULL,
      file_name TEXT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'Uploaded',
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE UNIQUE INDEX IF NOT EXISTS user_doc_type_idx ON student_documents (user_id, doc_type);

    -- Scholarships Table
    CREATE TABLE IF NOT EXISTS scholarships (
      id VARCHAR(50) PRIMARY KEY,
      name TEXT NOT NULL,
      deadline VARCHAR(50) NOT NULL,
      days_left INTEGER NOT NULL DEFAULT 30,
      amount NUMERIC NOT NULL,
      amount_formatted VARCHAR(50) NOT NULL,
      match_score INTEGER NOT NULL DEFAULT 90,
      category VARCHAR(50) NOT NULL,
      degree VARCHAR(50) NOT NULL,
      stream VARCHAR(50) DEFAULT 'General',
      provider TEXT NOT NULL,
      portal_url TEXT,
      is_govt BOOLEAN NOT NULL DEFAULT FALSE,
      min_score INTEGER NOT NULL DEFAULT 60,
      description TEXT NOT NULL,
      requirements TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS stream VARCHAR(50) DEFAULT 'General';

    -- User Saved Scholarships
    CREATE TABLE IF NOT EXISTS user_saved_scholarships (
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      scholarship_id VARCHAR(50) NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, scholarship_id)
    );

    -- User Submitted Applications
    CREATE TABLE IF NOT EXISTS user_scholarship_applications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      scholarship_id VARCHAR(50) NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
      applicant_name TEXT NOT NULL,
      course_name TEXT,
      gpa_score TEXT,
      statement TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'Submitted',
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Password Reset OTPs
    CREATE TABLE IF NOT EXISTS password_reset_otps (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      otp_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      attempts INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed All Schemes Including 10th & 12th Class School Schemes
  const seedItems = [
    // --------------------------------------------------
    // CLASS 10th & 12th SCHOOL SCHOLARSHIPS
    // --------------------------------------------------
    ['mahadbt-10th-1', 'MahaDBT Rajarshi Chhatrapati Shahu Maharaj Merit Scholarship for 10th Passed Students', '20 Nov 2026', 91, 12000, '₹12,000 / yr', 99, 'Government', 'School', 'General', 'Social Justice Department — MahaDBT Portal', 'https://mahadbt.maharashtra.gov.in', true, 75, 'Special merit scholarship for 10th Board passed SC & EBC students taking admission in 11th & 12th Class junior colleges.', 'Scored minimum 75% marks in Class 10th Board exam. Domicile of Maharashtra.'],
    ['mahadbt-10th-2', 'MahaDBT Post-Matric Scholarship for 10th/12th Class Students (OBC/VJNT/SBC)', '05 Dec 2026', 106, 15000, '₹15,000 / yr', 98, 'Government', 'School', 'General', 'VJNT, OBC & SBC Welfare Dept — MahaDBT Portal', 'https://mahadbt.maharashtra.gov.in', true, 50, 'Tuition fee and exam fee financial assistance for 10th board passed students enrolled in Class 11th and 12th stream.', 'Enrolled in 11th or 12th Class. Annual family income below ₹1.5 Lakhs.'],
    ['mahajyoti-10th', 'MahaJYOTI MHT-CET/JEE/NEET Free Coaching & Tab Allowance for 10th Passed Students', '15 Dec 2026', 116, 25000, '₹25,000 + Free Tab', 97, 'Government', 'School', 'STEM', 'MahaJYOTI Govt of Maharashtra (mahajyoti.org.in)', 'https://mahajyoti.org.in', true, 70, 'Free 11th & 12th Class entrance coaching (JEE/NEET/CET) plus free Android tablet for OBC/VJNT/SBC students.', 'Passed 10th Board Exam with 70%+ marks. Domicile of Maharashtra.'],
    ['vidya-10th', 'Vidyasaarathi Post-10th & 12th Standard Merit Scholarship', '10 Nov 2026', 81, 20000, '₹20,000 / yr', 96, 'General', 'School', 'General', 'NSDL Vidyasaarathi Corporate CSR', 'https://www.vidyasaarathi.co.in', false, 60, 'CSR financial grant for meritorious students pursuing 11th, 12th, or ITI diploma courses after 10th Class.', 'Enrolled in 11th, 12th or ITI. Family income below ₹3.5 Lakhs.'],
    ['nmmss-10th', 'National Means-cum-Merit Scholarship Scheme (NMMSS Class 10th-12th)', '30 Nov 2026', 101, 12000, '₹12,000 / yr', 95, 'Government', 'School', 'General', 'Ministry of Education (Govt of India) — NSP', 'https://scholarships.gov.in', true, 55, 'Central government scholarship grant for meritorious school students studying in Class 10th, 11th, and 12th.', 'Scored 55% in 8th/9th/10th class. Annual family income below ₹3.5 Lakhs.'],

    // --------------------------------------------------
    // UNDERGRADUATE & DEGREE SCHOLARSHIPS
    // --------------------------------------------------
    ['mahadbt-1', 'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti Yojna (MahaDBT EBC)', '15 Dec 2026', 116, 60000, '₹60,000 / yr', 98, 'Engineering', 'Undergraduate', 'Engineering', 'Government of Maharashtra — MahaDBT Portal', 'https://mahadbt.maharashtra.gov.in', true, 60, '50% to 100% tuition and exam fee reimbursement for EBC & General category students in engineering, degree & diploma courses.', 'Domicile of Maharashtra. Annual family income below ₹8 Lakhs.'],
    ['mahadbt-2', 'Dr. Punjabrao Deshmukh Vasatigruh Nirvah Bhatta Yojna (MahaDBT Hostel Allowance)', '31 Dec 2026', 132, 30000, '₹30,000 / yr', 95, 'Engineering', 'Undergraduate', 'Engineering', 'Government of Maharashtra — MahaDBT Portal', 'https://mahadbt.maharashtra.gov.in', true, 60, 'Hostel maintenance allowance for children of small landholders and registered laborers studying in professional colleges.', 'Hostel resident in Maharashtra. Domicile of Maharashtra State.'],
    ['mahadbt-3', 'Post-Matric Scholarship Scheme for OBC / VJNT / SBC Students (MahaDBT)', '20 Dec 2026', 121, 45000, '₹45,000 / yr', 96, 'Government', 'Undergraduate', 'General', 'VJNT, OBC & SBC Welfare Department — MahaDBT', 'https://mahadbt.maharashtra.gov.in', true, 50, '100% tuition and examination fee waiver for OBC, VJNT, and SBC students pursuing higher education in Maharashtra.', 'OBC / VJNT / SBC category certificate. Family income below ₹1.5 Lakhs.'],
    ['mahadbt-4', 'Government Post-Matric Scholarship for SC & ST Students (MahaDBT)', '05 Jan 2027', 137, 75000, '₹75,000 / yr', 97, 'Government', 'Undergraduate', 'General', 'Social Justice & Special Assistance Dept — MahaDBT', 'https://mahadbt.maharashtra.gov.in', true, 50, 'Full course tuition fee reimbursement plus monthly maintenance allowance for SC/ST students in Maharashtra.', 'SC / ST caste certificate. Domicile of Maharashtra.'],

    // MahaJYOTI & Vidyasaarathi Degree Schemes
    ['mahajyoti-1', 'MahaJYOTI MPhil & PhD Research Fellowship Scheme', '31 Dec 2026', 132, 372000, '₹31,000 / mo', 96, 'Research', 'Postgraduate', 'STEM', 'MahaJYOTI Govt of Maharashtra (mahajyoti.org.in)', 'https://mahajyoti.org.in', true, 65, 'Monthly research fellowship stipend of ₹31,000 + HRA for OBC/VJNT/SBC scholars pursuing PhD & MPhil research degrees.', 'OBC/VJNT/SBC category. Enrolled in recognized university PhD program.'],
    ['vidya-1', 'ACC Vidyasaarathi Scholarship for B.E / B.Tech Students', '10 Nov 2026', 81, 50000, '₹50,000 / yr', 95, 'Engineering', 'Undergraduate', 'Engineering', 'ACC Limited & NSDL Vidyasaarathi Portal', 'https://www.vidyasaarathi.co.in', false, 60, 'Corporate CSR scholarship for undergraduate engineering students admitted to accredited B.E / B.Tech programs.', 'Minimum 60% in Class 12 / Diploma. Annual family income below ₹5 Lakhs.']
  ];

  for (const item of seedItems) {
    await pool.query(
      `INSERT INTO scholarships (
        id, name, deadline, days_left, amount, amount_formatted, match_score,
        category, degree, stream, provider, portal_url, is_govt, min_score, description, requirements
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        amount = EXCLUDED.amount,
        amount_formatted = EXCLUDED.amount_formatted,
        degree = EXCLUDED.degree,
        stream = EXCLUDED.stream,
        portal_url = EXCLUDED.portal_url,
        is_govt = EXCLUDED.is_govt`,
      item
    );
  }

  console.log("PostgreSQL users, student_profiles & scholarships tables are ready.");
}

export async function closeDatabase() {
  await pool.end();
  console.log("PostgreSQL connection pool closed.");
}

export default pool;