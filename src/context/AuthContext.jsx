import { createContext, useState, useEffect, useCallback } from "react";
import * as authService from "../services/authService";

export const AuthContext = createContext(null);

const USER_KEY = "scholarhub_user";
const TOKEN_KEY = "scholarhub_token";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Restore session on first load
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setIsInitializing(false);
  }, []);

  const persistSession = useCallback((data) => {
    if (data?.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setUser(data.user);
    }
    if (data?.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
    }
  }, []);

  const signIn = useCallback(
    async (credentials) => {
      const result = await authService.login(credentials);
      if (result.success) {
        persistSession(result.data);
      }
      return result;
    },
    [persistSession]
  );

  const signUp = useCallback(
    async (payload) => {
      const result = await authService.register(payload);
      if (result.success) {
        persistSession(result.data);
      }
      return result;
    },
    [persistSession]
  );

  const signOut = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isInitializing,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
