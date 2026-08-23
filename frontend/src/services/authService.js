import axios from "axios";

// Backend authentication routes are mounted at:
// http://localhost:5000/login
// http://localhost:5000/register
// http://localhost:5000/logout

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to requests when available.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("scholarhub_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor to catch 401 authentication/token failures
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const code = error.response.data?.error?.code;
      if (
        code === "TOKEN_EXPIRED" ||
        code === "INVALID_TOKEN" ||
        code === "AUTH_REQUIRED"
      ) {
        window.dispatchEvent(
          new CustomEvent("scholarhub_session_expired", {
            detail: {
              code,
              message:
                error.response.data?.error?.message ||
                "Your session has expired.",
            },
          })
        );
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Login
 *
 * POST /login
 *
 * Request:
 * {
 *   email,
 *   password
 * }
 *
 * Success:
 * {
 *   user: {
 *     id,
 *     name,
 *     email,
 *     role
 *   },
 *   token
 * }
 */
export const login = async ({ email, password }) => {
  try {
    const { data } = await api.post("/login", {
      email,
      password,
    });

    return {
      success: true,
      data,
    };
  } catch (error) {
    return normalizeError(error);
  }
};

/**
 * Register
 *
 * POST /register
 *
 * Request:
 * {
 *   name,
 *   email,
 *   password
 * }
 *
 * Success:
 * {
 *   user: {
 *     id,
 *     name,
 *     email,
 *     role
 *   },
 *   token
 * }
 */
export const register = async ({ name, fullName, email, password }) => {
  try {
    const userName = name || fullName || "";
    const { data } = await api.post("/register", {
      name: userName,
      email,
      password,
    });

    return {
      success: true,
      data,
    };
  } catch (error) {
    return normalizeError(error);
  }
};

export const logout = async () => {
  try {
    await api.post("/logout");
  } catch (error) {
    // Even if the backend request fails,
    // remove the local session.
  } finally {
    localStorage.removeItem("scholarhub_token");
    localStorage.removeItem("scholarhub_user");
    localStorage.removeItem("scholarhub_avatar");
    localStorage.removeItem("scholarhub_saved_landing_name");
    localStorage.removeItem("scholarhub_profile_personal");
    localStorage.removeItem("scholarhub_profile_education");
    localStorage.removeItem("scholarhub_profile_financial");
    localStorage.removeItem("scholarhub_profile_eligibility");
    localStorage.removeItem("scholarhub_saved_ids");
    localStorage.removeItem("scholarhub_applied_ids");
  }

  return {
    success: true,
  };
};

/**
 * Request Password Reset OTP
 * POST /forgot-password
 */
export const forgotPassword = async ({ email }) => {
  try {
    const { data } = await api.post("/forgot-password", { email });
    return {
      success: true,
      data,
    };
  } catch (error) {
    return normalizeError(error);
  }
};

/**
 * Verify Password Reset OTP
 * POST /verify-otp
 */
export const verifyOtp = async ({ email, otp }) => {
  try {
    const { data } = await api.post("/verify-otp", { email, otp });
    return {
      success: true,
      data,
    };
  } catch (error) {
    return normalizeError(error);
  }
};

/**
 * Reset Password
 * POST /reset-password
 */
export const resetPassword = async ({ email, otp, newPassword }) => {
  try {
    const { data } = await api.post("/reset-password", {
      email,
      otp,
      newPassword,
    });
    return {
      success: true,
      data,
    };
  } catch (error) {
    return normalizeError(error);
  }
};

/**
 * Convert backend/Axios errors into
 * a predictable format for the frontend.
 */
function normalizeError(error) {
  // Backend cannot be reached
  if (!error.response) {
    return {
      success: false,
      code: "NETWORK_ERROR",
      message:
        "Unable to reach the server. Please check your connection.",
    };
  }

  const { status, data } = error.response;

  const backendError =
    typeof data?.error === "object" && data?.error !== null ? data.error : {};

  const backendCode =
    backendError.code ||
    data?.code ||
    (status ? `HTTP_${status}` : "UNKNOWN_ERROR");

  const rawBackendMessage =
    backendError.message ||
    data?.message ||
    (typeof data?.error === "string" ? data.error : "");

  // Invalid login credentials
  if (
    status === 401 &&
    (backendCode === "INVALID_CREDENTIALS" || !backendCode)
  ) {
    return {
      success: false,
      code: "INVALID_CREDENTIALS",
      message: rawBackendMessage || "Invalid email or password.",
    };
  }

  // Token expired or invalid
  if (
    status === 401 &&
    (backendCode === "TOKEN_EXPIRED" ||
      backendCode === "INVALID_TOKEN" ||
      backendCode === "AUTH_REQUIRED")
  ) {
    return {
      success: false,
      code: backendCode,
      message:
        rawBackendMessage || "Your session has expired. Please log in again.",
    };
  }

  // Email already registered
  if (status === 409 || backendCode === "EMAIL_EXISTS") {
    return {
      success: false,
      code: "EMAIL_EXISTS",
      message:
        rawBackendMessage || "An account with this email already exists.",
    };
  }

  // Validation error
  if (status === 400 || backendCode === "VALIDATION_ERROR") {
    return {
      success: false,
      code: backendCode,
      message:
        rawBackendMessage || "Please check the information you entered.",
    };
  }

  return {
    success: false,
    code: backendCode,
    message:
      rawBackendMessage || "Something went wrong. Please try again.",
  };
}

export default api;