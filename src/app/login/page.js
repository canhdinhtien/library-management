"use client";

import React from "react";
import Navbar from "../../components/Navbar";
import Link from "next/link";
import { useLogin } from "../../hooks/useLogin";

export default function Login() {
  const {
    username,
    password,
    setUsername,
    setPassword,
    error,
    isLoading,
    handleLogin,
  } = useLogin();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <section className="flex flex-col items-center justify-center px-4 py-16 sm:px-6 md:px-8 lg:py-20">
        <div className="w-full max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 sm:text-4xl lg:text-5xl">
              Welcome Back
            </h2>
            <p className="text-gray-600 text-base sm:text-lg lg:text-xl">
              Please login to your account to continue.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden p-8 sm:p-10 lg:p-12 border border-gray-100 transition-all duration-300 hover:shadow-xl">
            <form onSubmit={handleLogin} className="space-y-8">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1 lg:text-base"
                >
                  username
                </label>
                <div className="relative text-gray-900">
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 lg:px-5 lg:py-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 text-sm lg:text-base disabled:bg-gray-100"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 lg:text-base"
                  >
                    password
                  </label>
                  <Link
                    href="/forgotpass"
                    className="text-xs text-yellow-600 hover:text-yellow-800 hover:underline font-medium lg:text-sm"
                  >
                    Don&apos;t remember password?
                  </Link>
                </div>
                <div className="relative text-gray-900">
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 lg:px-5 lg:py-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 text-sm lg:text-base disabled:bg-gray-100"
                  />
                </div>
              </div>
              {/* 
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  disabled={isLoading}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700 lg:text-base"
                >
                  Remember me
                </label>
              </div>
              */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  disabled={isLoading}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700 lg:text-base"
                >
                  Remember me
                </label>
              </div>
              {error && (
                <div className="text-red-600 text-sm text-center p-2 bg-red-50 rounded border border-red-200">
                  {error}
                </div>
              )}
              <button
                id="login"
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-400 text-white font-medium py-3 px-4 lg:py-4 lg:px-6 rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg text-sm lg:text-base disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
              </div>
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600 lg:text-base">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="text-yellow-600 hover:text-yellow-800 hover:underline font-medium"
                  >
                    Create an account
                  </Link>
                </p>
                <p className="text-xs text-gray-500 mt-4 lg:text-sm">
                  <Link
                    href="/"
                    className="hover:text-gray-700 hover:underline"
                  >
                    Back to Home
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
