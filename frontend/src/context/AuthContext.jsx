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
    const savedName = localStorage.getItem(SAVED_NAME_KEY);

    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser);
      if (savedName && (!parsedUser.name || !parsedUser.fullName)) {
        parsedUser.name = parsedUser.name || savedName;
        parsedUser.fullName = parsedUser.fullName || savedName;
      }
      setUser(parsedUser);
    }
    setIsInitializing(false);
  }, []);

  const persistSession = useCallback((data) => {
    if (data?.user) {
      const savedName = localStorage.getItem(SAVED_NAME_KEY);
      const userObj = {
        ...data.user,
        name: data.user.name || data.user.fullName || savedName || "",
        fullName: data.user.fullName || data.user.name || savedName || "",
      };

      if (userObj.name) {
        localStorage.setItem(SAVED_NAME_KEY, userObj.name);
      }

      localStorage.setItem(USER_KEY, JSON.stringify(userObj));
      setUser(userObj);
    }

    if (data?.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
    }
  }, []);

  const updateUser = useCallback((updatedFields) => {
    setUser((prevUser) => {
      const newUser = prevUser ? { ...prevUser, ...updatedFields } : { ...updatedFields, role: "Student" };
      if (updatedFields.name || updatedFields.fullName) {
        const nameVal = updatedFields.fullName || updatedFields.name;
        localStorage.setItem(SAVED_NAME_KEY, nameVal);
      }
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      return newUser;
    });
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
        // If payload had a name, attach it to user object
        if (payload.name && result.data?.user) {
          result.data.user.name = payload.name;
          result.data.user.fullName = payload.name;
        }
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
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
