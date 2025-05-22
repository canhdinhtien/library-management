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
    // Kiểm tra token ban đầu khi component được mount
    console.log("AuthProvider useEffect: Checking initial token...");
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        // Kiểm tra xem token đã hết hạn chưa
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

  // Hàm login để lưu token và thiết lập user
  const login = (userInfo, accessToken) => {
    console.log("AuthContext login: Saving token and setting user:", userInfo);

    if (typeof accessToken !== "string") {
      console.error(
        "AuthContext login: accessToken must be a string. Got:",
        accessToken
      );
      return;
    }

    localStorage.setItem("authToken", accessToken);

    try {
      const decoded = jwtDecode(accessToken);
      setUser(decoded);
    } catch (error) {
      console.error("AuthContext login: Error decoding token:", error);
      localStorage.removeItem("authToken");
      setUser(null);
    }
  };

  // Hàm logout để xóa token và thiết lập user thành null
  const logout = () => {
    console.log("AuthContext logout: Removing token and clearing user state.");
    localStorage.removeItem("authToken");
    setUser(null);
    router.push("/login");
  };

  const authValue = {
    user, // Thông tin người dùng
    loading, // Trạng thái loading
    login, // Hàm login
    logout, // Hàm logout
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
