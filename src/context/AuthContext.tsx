import { createContext, useContext, useState, useLayoutEffect } from "react";
import type { ReactNode } from "react";

//////////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////////

interface User {
  id: string;
  email: string;
  role: string;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: any, rememberMe?: boolean) => void;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

//////////////////////////////////////////////////////////
// CONTEXT
//////////////////////////////////////////////////////////

const AuthContext = createContext<AuthContextType | null>(null);

//////////////////////////////////////////////////////////
// STORAGE HELPERS
// - localStorage  → persists across browser restarts (rememberMe = true)
// - sessionStorage → cleared when tab/browser closes  (rememberMe = false)
//////////////////////////////////////////////////////////

const STORAGE_KEY_TOKEN = "token";
const STORAGE_KEY_USER  = "user";

/** Read token from either storage (localStorage takes priority) */
const readToken = (): string | null => {
  try {
    const ls = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (ls && ls !== "undefined" && ls !== "null") return ls;
    const ss = sessionStorage.getItem(STORAGE_KEY_TOKEN);
    if (ss && ss !== "undefined" && ss !== "null") return ss;
  } catch { /* ignore */ }
  return null;
};

/** Read user from either storage (localStorage takes priority) */
const readUser = (): User | null => {
  try {
    const ls = localStorage.getItem(STORAGE_KEY_USER);
    if (ls && ls !== "undefined" && ls !== "null") return JSON.parse(ls);
    const ss = sessionStorage.getItem(STORAGE_KEY_USER);
    if (ss && ss !== "undefined" && ss !== "null") return JSON.parse(ss);
  } catch { /* ignore */ }
  return null;
};

/** Write token + user to the appropriate storage */
const writeSession = (token: string, user: User, rememberMe: boolean) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(STORAGE_KEY_TOKEN, token);
  storage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
};

/** Clear token + user from BOTH storages */
const clearSession = () => {
  localStorage.removeItem(STORAGE_KEY_TOKEN);
  localStorage.removeItem(STORAGE_KEY_USER);
  sessionStorage.removeItem(STORAGE_KEY_TOKEN);
  sessionStorage.removeItem(STORAGE_KEY_USER);
};

//////////////////////////////////////////////////////////
// PROVIDER
//////////////////////////////////////////////////////////

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // loading = true on first render so ProtectedRoute waits before redirecting.
  // useLayoutEffect fires synchronously before paint and flips it to false
  // after the storage read completes — no async work, no flicker.
  const [loading, setLoading] = useState(true);

  // Initialize user from storage (synchronous read)
  const [user, setUser] = useState<User | null>(() => {
    const token = readToken();
    const storedUser = readUser();
    return token && storedUser ? storedUser : null;
  });

  // Flip loading off after the first synchronous render cycle.
  // useLayoutEffect runs before the browser paints, so ProtectedRoute
  // never renders a redirect on the frame where user is still being read.
  useLayoutEffect(() => {
    setLoading(false);
  }, []);

  //////////////////////////////////////////////////////////
  // LOGIN
  // rememberMe = true  → localStorage  (survives browser restart)
  // rememberMe = false → sessionStorage (cleared on tab close)
  //////////////////////////////////////////////////////////

  const login = (data: any, rememberMe = false) => {
    try {
      clearSession(); // always start clean

      if (data?.access_token && data?.user) {
        writeSession(data.access_token, data.user, rememberMe);
        setUser(data.user);
      } else {
        console.error("Invalid login data:", data);
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  //////////////////////////////////////////////////////////
  // LOGOUT
  //////////////////////////////////////////////////////////

  const logout = () => {
    try {
      clearSession();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

//////////////////////////////////////////////////////////
// HOOK
//////////////////////////////////////////////////////////

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
