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
  const { userId, personal, education, currentEducation, pastEducation, livingStatus, financial, eligibility, documents } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  try {
    const curEd = currentEducation || education || {};
    const pastEd = pastEducation || education || {};
    const livStat = livingStatus || {};
    const fin = financial || {};
    const el = eligibility || {};

    const annualIncome = fin.annualIncome ? parseFloat(String(fin.annualIncome).replace(/,/g, "")) : null;
    const monthlyLivingCost = livStat.monthlyLivingCost ? parseFloat(String(livStat.monthlyLivingCost).replace(/,/g, "")) : null;

    // Upsert into student_profiles table
    await pool.query(
      `INSERT INTO student_profiles (
        user_id, current_course, qualification, college_name, year_semester,
        marks_percentage, passing_year, stream_branch, tenth_percentage, twelfth_percentage,
        living_type, monthly_living_cost, annual_income,
        guardian_occupation, income_cert_no, income_issuing_auth, category,
        domicile_state, is_minority, is_disability, special_criteria, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, CURRENT_TIMESTAMP
      ) ON CONFLICT (user_id) DO UPDATE SET
        current_course = EXCLUDED.current_course,
        qualification = EXCLUDED.qualification,
        college_name = EXCLUDED.college_name,
        year_semester = EXCLUDED.year_semester,
        marks_percentage = EXCLUDED.marks_percentage,
        passing_year = EXCLUDED.passing_year,
        stream_branch = EXCLUDED.stream_branch,
        tenth_percentage = EXCLUDED.tenth_percentage,
        twelfth_percentage = EXCLUDED.twelfth_percentage,
        living_type = EXCLUDED.living_type,
        monthly_living_cost = EXCLUDED.monthly_living_cost,
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
        curEd.currentCourse || null,
        curEd.qualification || null,
        curEd.collegeName || null,
        curEd.yearSemester || null,
        curEd.marksPercentage || null,
        curEd.passingYear || null,
        curEd.streamBranch || null,
        pastEd.tenthPercentage || null,
        pastEd.twelfthPercentage || null,
        livStat.livingType || "Day Scholar at Home",
        monthlyLivingCost,
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
