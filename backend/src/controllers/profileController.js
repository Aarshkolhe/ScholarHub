import pool from "../config/db.js";

// 1. Get Profile Details from PostgreSQL
export async function getProfile(req, res) {
  const userId = req.query.userId || req.body.userId;
  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  try {
    const profileResult = await pool.query(
      `SELECT * FROM student_profiles WHERE user_id = $1`,
      [userId]
    );

    const docResult = await pool.query(
      `SELECT doc_type, file_name, status, created_at FROM student_documents WHERE user_id = $1`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      profile: profileResult.rows[0] || null,
      documents: docResult.rows || [],
    });
  } catch (error) {
    console.error("Error fetching profile from DB:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
}

// 2. Save / Update Profile Details in PostgreSQL
export async function saveProfile(req, res) {
  const { userId, education, financial, eligibility, documents } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  try {
    const ed = education || {};
    const fin = financial || {};
    const el = eligibility || {};

    const annualIncome = fin.annualIncome ? parseFloat(fin.annualIncome) : null;

    // Upsert into student_profiles table
    await pool.query(
      `INSERT INTO student_profiles (
        user_id, current_course, qualification, college_name, year_semester,
        marks_percentage, passing_year, stream_branch, annual_income,
        guardian_occupation, income_cert_no, income_issuing_auth, category,
        domicile_state, is_minority, is_disability, special_criteria, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, CURRENT_TIMESTAMP
      ) ON CONFLICT (user_id) DO UPDATE SET
        current_course = EXCLUDED.current_course,
        qualification = EXCLUDED.qualification,
        college_name = EXCLUDED.college_name,
        year_semester = EXCLUDED.year_semester,
        marks_percentage = EXCLUDED.marks_percentage,
        passing_year = EXCLUDED.passing_year,
        stream_branch = EXCLUDED.stream_branch,
        annual_income = EXCLUDED.annual_income,
        guardian_occupation = EXCLUDED.guardian_occupation,
        income_cert_no = EXCLUDED.income_cert_no,
        income_issuing_auth = EXCLUDED.income_issuing_auth,
        category = EXCLUDED.category,
        domicile_state = EXCLUDED.domicile_state,
        is_minority = EXCLUDED.is_minority,
        is_disability = EXCLUDED.is_disability,
        special_criteria = EXCLUDED.special_criteria,
        updated_at = CURRENT_TIMESTAMP`,
      [
        userId,
        ed.currentCourse || null,
        ed.qualification || null,
        ed.collegeName || null,
        ed.yearSemester || null,
        ed.marksPercentage || null,
        ed.passingYear || null,
        ed.streamBranch || null,
        annualIncome,
        fin.guardianOccupation || null,
        fin.incomeCertNo || null,
        fin.incomeIssuingAuth || null,
        el.category || null,
        el.domicileState || null,
        el.isMinority || "No",
        el.isDisability || "No",
        el.specialCriteria || null,
      ]
    );

    // Sync Documents if provided
    if (documents && typeof documents === "object") {
      for (const [docType, docData] of Object.entries(documents)) {
        if (docData && docData.fileName) {
          await pool.query(
            `INSERT INTO student_documents (user_id, doc_type, file_name, status)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id, doc_type) DO UPDATE SET
             file_name = EXCLUDED.file_name, status = EXCLUDED.status`,
            [userId, docType, docData.fileName, docData.status || "Uploaded"]
          );
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Profile and documents successfully saved to PostgreSQL database!",
    });
  } catch (error) {
    console.error("Error saving profile to DB:", error);
    return res.status(500).json({ success: false, message: "Database save error" });
  }
}
