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
  // Initialize user state synchronously from localStorage
  const [user, setUser] = useState<User | null>(() => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      
      if (token && storedUser && token !== "undefined" && token !== "null" && storedUser !== "undefined" && storedUser !== "null") {
        return JSON.parse(storedUser);
      }
    } catch (error) {
      console.error("Failed to initialize user from localStorage:", error);
    }
    return null;
  });
  
  // Start with loading false since we initialize synchronously
  const [loading, setLoading] = useState(false);

  //////////////////////////////////////////////////////////
  // VERIFY AUTH STATE ON MOUNT (optional validation)
  //////////////////////////////////////////////////////////

  useEffect(() => {
    // Optional: Add any async validation here if needed
    // For now, we trust localStorage since we initialize synchronously
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