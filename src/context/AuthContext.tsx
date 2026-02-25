import React, { createContext, useContext, useState } from "react";

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

const AuthContext = createContext<AuthContextType | null>(null);

//////////////////////////////////////////////////////////
// SAFE LOCALSTORAGE PARSER
//////////////////////////////////////////////////////////

const getStoredUser = (): User | null => {
  const stored = localStorage.getItem("user");

  if (!stored || stored === "undefined" || stored === "null") {
    return null;
  }

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

//////////////////////////////////////////////////////////
// PROVIDER
//////////////////////////////////////////////////////////

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [loading, setLoading] = useState(false);

  const login = (data: any) => {
    // Defensive: clear before setting
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    if (data?.access_token) {
      localStorage.setItem("token", data.access_token);
    }

    if (data?.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
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
  if (!context) throw new Error("AuthContext not found");
  return context;
};