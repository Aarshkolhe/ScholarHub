import { createContext, useState, useEffect, useCallback } from "react";
import * as authService from "../services/authService";

export const AuthContext = createContext(null);

const USER_KEY = "scholarhub_user";
const TOKEN_KEY = "scholarhub_token";
const SAVED_NAME_KEY = "scholarhub_saved_landing_name";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Restore session on first load
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const uid = parsedUser.id ? `_${parsedUser.id}` : "";
        const userAvatar = parsedUser.avatar || localStorage.getItem(`scholarhub_avatar${uid}`) || "";
        const userName = parsedUser.fullName || parsedUser.name || parsedUser.email?.split("@")[0] || "Student";

        const restored = {
          ...parsedUser,
          name: userName,
          fullName: userName,
          avatar: userAvatar,
          role: parsedUser.role || "Student",
        };
        setUser(restored);
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setIsInitializing(false);
  }, []);

  const persistSession = useCallback(async (data) => {
    if (data?.user) {
      const u = data.user;
      const uid = u.id ? `_${u.id}` : "";

      // Clean old legacy unscoped keys so they don't leak into new user
      localStorage.removeItem("scholarhub_avatar");
      localStorage.removeItem("scholarhub_saved_landing_name");
      localStorage.removeItem("scholarhub_profile_personal");
      localStorage.removeItem("scholarhub_profile_education");
      localStorage.removeItem("scholarhub_profile_financial");
      localStorage.removeItem("scholarhub_profile_eligibility");
      localStorage.removeItem("scholarhub_saved_ids");
      localStorage.removeItem("scholarhub_applied_ids");

      // Resolve user avatar & name strictly for this user
      const userAvatar = u.avatar || localStorage.getItem(`scholarhub_avatar${uid}`) || "";
      const userName = u.fullName || u.name || u.email?.split("@")[0] || "Student";

      const userObj = {
        ...u,
        name: userName,
        fullName: userName,
        email: u.email,
        role: u.role || "Student",
        avatar: userAvatar,
      };

      localStorage.setItem(USER_KEY, JSON.stringify(userObj));
      localStorage.setItem(SAVED_NAME_KEY, userName);
      localStorage.setItem(`scholarhub_saved_landing_name${uid}`, userName);
      if (userAvatar) {
        localStorage.setItem(`scholarhub_avatar${uid}`, userAvatar);
      }

      setUser(userObj);

      // Fetch saved profile from PostgreSQL for this user if available
      if (u.id) {
        try {
          const resp = await fetch(`http://localhost:5000/api/profile?userId=${encodeURIComponent(u.id)}`);
          const resJson = await resp.json();
          if (resJson.success && resJson.profile) {
            const p = resJson.profile;
            const ed = {
              currentCourse: p.current_course || "",
              qualification: p.qualification || "",
              collegeName: p.college_name || "",
              yearSemester: p.year_semester || "",
              marksPercentage: p.marks_percentage || "",
              passingYear: p.passing_year || "",
              streamBranch: p.stream_branch || "",
              tenthPercentage: "",
              twelfthPercentage: "",
              degreeLevel: p.qualification || "",
              currentStream: p.stream_branch || "",
            };
            const fin = {
              annualIncome: p.annual_income ? String(p.annual_income) : "",
              guardianOccupation: p.guardian_occupation || "",
              incomeCertNo: p.income_cert_no || "",
              incomeIssuingAuth: p.income_issuing_auth || "",
            };
            const el = {
              category: p.category || "",
              domicileState: p.domicile_state || "",
              isMinority: p.is_minority || "No",
              isDisability: p.is_disability || "No",
              specialCriteria: p.special_criteria || "",
            };
            const personal = {
              fullName: userName,
              email: u.email,
              phone: "",
              gender: "",
              dob: "",
              age: "",
            };
            localStorage.setItem(`scholarhub_profile_education${uid}`, JSON.stringify(ed));
            localStorage.setItem(`scholarhub_profile_financial${uid}`, JSON.stringify(fin));
            localStorage.setItem(`scholarhub_profile_eligibility${uid}`, JSON.stringify(el));
            localStorage.setItem(`scholarhub_profile_personal${uid}`, JSON.stringify(personal));
          }
        } catch {
          // Backend fetch fallback
        }
      }
    }

    if (data?.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
    }
  }, []);

  const updateUser = useCallback((updatedFields) => {
    setUser((prevUser) => {
      const newUser = prevUser ? { ...prevUser, ...updatedFields } : { ...updatedFields, role: "Student" };
      const uid = newUser.id ? `_${newUser.id}` : "";

      if (updatedFields.name || updatedFields.fullName) {
        const nameVal = updatedFields.fullName || updatedFields.name;
        localStorage.setItem(SAVED_NAME_KEY, nameVal);
        localStorage.setItem(`scholarhub_saved_landing_name${uid}`, nameVal);
      }
      if (updatedFields.avatar !== undefined) {
        if (updatedFields.avatar) {
          localStorage.setItem(`scholarhub_avatar${uid}`, updatedFields.avatar);
          localStorage.setItem("scholarhub_avatar", updatedFields.avatar);
        } else {
          localStorage.removeItem(`scholarhub_avatar${uid}`);
          localStorage.removeItem("scholarhub_avatar");
        }
      }
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      return newUser;
    });
  }, []);

  const signIn = useCallback(
    async (credentials) => {
      const result = await authService.login(credentials);
      if (result.success) {
        await persistSession(result.data);
      }
      return result;
    },
    [persistSession]
  );

  const signUp = useCallback(
    async (payload) => {
      const result = await authService.register(payload);
      if (result.success) {
        if (payload.name && result.data?.user) {
          result.data.user.name = payload.name;
          result.data.user.fullName = payload.name;
        }
        await persistSession(result.data);
      }
      return result;
    },
    [persistSession]
  );

  const signOut = useCallback(async () => {
    await authService.logout();
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SAVED_NAME_KEY);
    localStorage.removeItem("scholarhub_avatar");
    localStorage.removeItem("scholarhub_profile_personal");
    localStorage.removeItem("scholarhub_profile_education");
    localStorage.removeItem("scholarhub_profile_financial");
    localStorage.removeItem("scholarhub_profile_eligibility");
    localStorage.removeItem("scholarhub_saved_ids");
    localStorage.removeItem("scholarhub_applied_ids");
    setUser(null);
  }, []);

  const loadSimulationSession = useCallback((demoUser) => {
    const userToSet = demoUser || {
      id: "usr_sim_demo",
      name: "Aarsh Kolhe",
      fullName: "Aarsh Kolhe",
      email: "aarsh@scholarhub.edu",
      role: "Student",
    };
    const uid = "_usr_sim_demo";
    localStorage.setItem(USER_KEY, JSON.stringify(userToSet));
    localStorage.setItem(TOKEN_KEY, "scholarhub_simulation_demo_token");
    localStorage.setItem(SAVED_NAME_KEY, userToSet.name);
    localStorage.setItem(`scholarhub_saved_landing_name${uid}`, userToSet.name);
    setUser(userToSet);
  }, []);

  const clearSimulationSession = useCallback(() => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SAVED_NAME_KEY);
    localStorage.removeItem("scholarhub_avatar");
    localStorage.removeItem("scholarhub_avatar__usr_sim_demo");
    localStorage.removeItem("scholarhub_saved_landing_name__usr_sim_demo");
    localStorage.removeItem("scholarhub_profile_personal");
    localStorage.removeItem("scholarhub_profile_education");
    localStorage.removeItem("scholarhub_profile_financial");
    localStorage.removeItem("scholarhub_profile_eligibility");
    localStorage.removeItem("scholarhub_saved_ids");
    localStorage.removeItem("scholarhub_applied_ids");
    localStorage.removeItem("scholarhub_profile_personal__usr_sim_demo");
    localStorage.removeItem("scholarhub_profile_education__usr_sim_demo");
    localStorage.removeItem("scholarhub_profile_financial__usr_sim_demo");
    localStorage.removeItem("scholarhub_profile_eligibility__usr_sim_demo");
    localStorage.removeItem("scholarhub_saved_ids__usr_sim_demo");
    localStorage.removeItem("scholarhub_applied_ids__usr_sim_demo");
    setUser(null);
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isInitializing,
    signIn,
    signUp,
    signOut,
    updateUser,
    loadSimulationSession,
    clearSimulationSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
