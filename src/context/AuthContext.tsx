import { createContext, useContext, useState, useEffect } from "react";
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
  login: (data: any) => void;
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
// SAFE LOCALSTORAGE PARSER
//////////////////////////////////////////////////////////

const getStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem("user");

    if (!stored || stored === "undefined" || stored === "null") {
      return null;
    }

    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to parse stored user:", error);
    return null;
  }
};

const getStoredToken = (): string | null => {
  try {
    const token = localStorage.getItem("token");
    return token && token !== "undefined" && token !== "null" ? token : null;
  } catch (error) {
    console.error("Failed to get stored token:", error);
    return null;
  }
};

//////////////////////////////////////////////////////////
// PROVIDER
//////////////////////////////////////////////////////////

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  //////////////////////////////////////////////////////////
  // INITIALIZE AUTH STATE ON MOUNT
  //////////////////////////////////////////////////////////

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = getStoredToken();
        const storedUser = getStoredUser();

        // Both token and user must exist
        if (token && storedUser) {
          setUser(storedUser);
        } else {
          // Clear inconsistent state
          if (token || storedUser) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
          setUser(null);
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  //////////////////////////////////////////////////////////
  // LOGIN
  //////////////////////////////////////////////////////////

  const login = (data: any) => {
    try {
      // Defensive: clear before setting
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      if (data?.access_token && data?.user) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
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