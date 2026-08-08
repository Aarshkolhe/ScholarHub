import axios from "axios";

// Base API instance. Point VITE_API_BASE_URL at your backend in a .env file.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach auth token (if present) to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("scholarhub_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Attempts to sign a user in.
 * Expected backend contract: POST /login { email, password }
 * Success -> { user: { id, name, email, role }, token }
 * Failure -> backend responds 404 with { message: "User Not Found" }
 *            or 401 with { message: "Invalid Password" }
 */
export const login = async ({ email, password }) => {
  try {
    const { data } = await api.post("/login", { email, password });
    return { success: true, data };
  } catch (error) {
    return normalizeError(error);
  }
};

/**
 * Registers a new user.
 * Expected backend contract: POST /register { ...full form payload }
 * Success -> { user: { id, name, email, role }, token }
 * Failure -> 409 with { message: "Email Already Exists" }
 */
export const register = async (payload) => {
  try {
    const { data } = await api.post("/register", payload);
    return { success: true, data };
  } catch (error) {
    return normalizeError(error);
  }
};

/**
 * Logs the current user out. Clears local session and (optionally)
 * informs the backend so it can invalidate the token/session.
 */
export const logout = async () => {
  try {
    await api.post("/logout");
  } catch (error) {
    // Non-fatal: still clear local session even if the network call fails
  } finally {
    localStorage.removeItem("scholarhub_token");
    localStorage.removeItem("scholarhub_user");
  }
  return { success: true };
};

/**
 * Normalizes Axios errors into a predictable shape the UI can branch on.
 */
function normalizeError(error) {
  if (!error.response) {
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to reach the server. Please check your connection.",
    };
  }

  const { status, data } = error.response;
  const backendMessage = data?.message || "";

  if (status === 404 || /user not found/i.test(backendMessage)) {
    return { success: false, code: "USER_NOT_FOUND", message: "User Not Found" };
  }

  if (status === 401 || /invalid password/i.test(backendMessage)) {
    return { success: false, code: "INVALID_PASSWORD", message: "Invalid Password" };
  }

  if (status === 409 || /already exists/i.test(backendMessage)) {
    return { success: false, code: "EMAIL_EXISTS", message: "Email Already Exists" };
  }

  return {
    success: false,
    code: "UNKNOWN_ERROR",
    message: backendMessage || "Something went wrong. Please try again.",
  };
}

export default api;
