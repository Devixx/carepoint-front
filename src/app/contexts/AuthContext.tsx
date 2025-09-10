"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { http } from "../lib/http";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  specialty?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("doctor-token");
    if (token) {
      // Set authorization header for all requests
      http.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // Try to validate token and get user info
      validateToken();
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateToken = async () => {
    try {
      // You'll need to create this endpoint in your backend
      const response = await http.get("/auth/profile");
      setUser(response.data);
    } catch (error) {
      console.error("Token validation failed:", error);
      // Clear invalid token
      localStorage.removeItem("doctor-token");
      delete http.defaults.headers.common["Authorization"];
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await http.post("/auth/login", { email, password });
      const { access_token, user } = response.data;

      // Store token with doctor prefix
      localStorage.setItem("doctor-token", access_token);

      // Set authorization header for future requests
      http.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      setUser(user);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("doctor-token");
    delete http.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
