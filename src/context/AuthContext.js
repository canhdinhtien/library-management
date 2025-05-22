"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log("AuthProvider useEffect: Checking initial token...");
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp && decoded.exp > currentTime) {
          console.log(
            "AuthProvider useEffect: Token valid, setting user:",
            decoded
          );
          setUser(decoded);
        } else {
          console.log("AuthProvider useEffect: Token expired, removing.");
          localStorage.removeItem("authToken");
        }
      } catch (error) {
        console.error("AuthProvider useEffect: Invalid token found:", error);
        localStorage.removeItem("authToken");
      }
    } else {
      console.log("AuthProvider useEffect: No token found initially.");
    }
    setLoading(false);
    console.log("AuthProvider useEffect: Initial loading finished.");
  }, []);

  const login = (userData, token) => {
    console.log("AuthContext login: Saving token and setting user:", userData);
    localStorage.setItem("authToken", token);

    try {
      const decodedLogin = jwtDecode(token);
      setUser(decodedLogin);
    } catch (error) {
      console.error("AuthContext login: Error decoding token:", error);

      localStorage.removeItem("authToken");
      setUser(null);
    }
  };

  const logout = () => {
    console.log("AuthContext logout: Removing token and clearing user state.");
    localStorage.removeItem("authToken");
    setUser(null);
    router.push("/login");
  };

  const authValue = {
    user,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
