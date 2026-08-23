import pool from "../config/db.js";

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function isValidUUID(id) {
  return typeof id === "string" && UUID_REGEX.test(id);
}

// 1. Get Profile Details from PostgreSQL
export async function getProfile(req, res) {
  // Identity comes exclusively from req.user.id after authenticateToken
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: { code: "AUTH_REQUIRED", message: "Authentication is required to view profile." }
    });
  }

  if (!isValidUUID(userId)) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid user ID format." }
    });
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
  // Identity comes exclusively from req.user.id after authenticateToken
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: { code: "AUTH_REQUIRED", message: "Authentication is required to save profile." }
    });
  }

  if (!isValidUUID(userId)) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid user ID format." }
    });
  }

  const { personal, education, currentEducation, pastEducation, livingStatus, financial, eligibility, documents } = req.body;

  try {
    // Fetch existing profile to preserve omitted sections
    const existingRes = await pool.query(`SELECT * FROM student_profiles WHERE user_id = $1`, [userId]);
    const existing = existingRes.rows[0] || {};

    const curEdObj = currentEducation !== undefined ? currentEducation : education;
    const pastEdObj = pastEducation !== undefined ? pastEducation : education;
    const livStatObj = livingStatus;
    const finObj = financial;
    const elObj = eligibility;

    // Helper:
    // Omitted section object or omitted field -> preserve existing DB value
    // Provided field -> update value (explicit empty string / null clears field)
    const getVal = (sectionObj, fieldName, existingVal, defaultVal = null) => {
      if (sectionObj !== undefined && sectionObj !== null && typeof sectionObj === "object" && fieldName in sectionObj) {
        const val = sectionObj[fieldName];
        if (val === "" || val === null) return null;
        if (val === undefined) return existingVal !== undefined && existingVal !== null ? existingVal : defaultVal;
        return val;
      }
      return existingVal !== undefined && existingVal !== null ? existingVal : defaultVal;
    };

    const currentCourse = getVal(curEdObj, "currentCourse", existing.current_course);
    const qualification = getVal(curEdObj, "qualification", existing.qualification, "Undergraduate (UG)");
    const collegeName = getVal(curEdObj, "collegeName", existing.college_name);
    const yearSemester = getVal(curEdObj, "yearSemester", existing.year_semester);
    const marksPercentage = getVal(curEdObj, "marksPercentage", existing.marks_percentage);
    const passingYear = getVal(curEdObj, "passingYear", existing.passing_year);
    const streamBranch = getVal(curEdObj, "streamBranch", existing.stream_branch);

    const tenthPercentage = getVal(pastEdObj, "tenthPercentage", existing.tenth_percentage);
    const twelfthPercentage = getVal(pastEdObj, "twelfthPercentage", existing.twelfth_percentage);

    const livingType = getVal(livStatObj, "livingType", existing.living_type, "Day Scholar at Home");

    let monthlyLivingCost = existing.monthly_living_cost;
    if (livStatObj !== undefined && livStatObj !== null) {
      const rawCost = livStatObj.monthlyLivingCost;
      monthlyLivingCost = rawCost ? parseFloat(String(rawCost).replace(/,/g, "")) : null;
    }

    let annualIncome = existing.annual_income;
    if (finObj !== undefined && finObj !== null) {
      const rawInc = finObj.annualIncome;
      annualIncome = rawInc ? parseFloat(String(rawInc).replace(/,/g, "")) : null;
    }

    const guardianOccupation = getVal(finObj, "guardianOccupation", existing.guardian_occupation);
    const incomeCertNo = getVal(finObj, "incomeCertNo", existing.income_cert_no);
    const incomeIssuingAuth = getVal(finObj, "incomeIssuingAuth", existing.income_issuing_auth);

    const category = getVal(elObj, "category", existing.category);
    const domicileState = getVal(elObj, "domicileState", existing.domicile_state);
    const isMinority = getVal(elObj, "isMinority", existing.is_minority, "No");
    const isDisability = getVal(elObj, "isDisability", existing.is_disability, "No");
    const specialCriteria = getVal(elObj, "specialCriteria", existing.special_criteria);

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
        currentCourse,
        qualification,
        collegeName,
        yearSemester,
        marksPercentage,
        passingYear,
        streamBranch,
        tenthPercentage,
        twelfthPercentage,
        livingType,
        monthlyLivingCost,
        annualIncome,
        guardianOccupation,
        incomeCertNo,
        incomeIssuingAuth,
        category,
        domicileState,
        isMinority,
        isDisability,
        specialCriteria,
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
