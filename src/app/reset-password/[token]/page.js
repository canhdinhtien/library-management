"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token;

  const [formState, setFormState] = useState({
    password: "",
    confirmPassword: "",
    showNewPassword: false,
    showConfirmPassword: false,
  });

  const [uiState, setUiState] = useState({
    loading: false,
    message: "",
    submitError: "",
    tokenCheckStatus: "checking",
    tokenErrorMessage: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    if (!uiState.loading) {
      setFormState((prev) => ({
        ...prev,
        [field]: !prev[field],
      }));
    }
  };

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setUiState((prev) => ({
          ...prev,
          tokenCheckStatus: "invalid",
          tokenErrorMessage: "No reset token found in the URL.",
        }));
        return;
      }

      try {
        setUiState((prev) => ({ ...prev, tokenCheckStatus: "checking" }));

        const res = await fetch(
          `/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`
        );
        const data = await res.json();

        setUiState((prev) => ({
          ...prev,
          tokenCheckStatus: res.ok && data.isValid ? "valid" : "invalid",
          tokenErrorMessage:
            !res.ok || !data.isValid
              ? data.message || "Failed to verify reset token."
              : "",
        }));
      } catch (err) {
        console.error("Error verifying token:", err);
        setUiState((prev) => ({
          ...prev,
          tokenCheckStatus: "invalid",
          tokenErrorMessage:
            "An error occurred while verifying the link. Please try again later.",
        }));
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setUiState((prev) => ({
      ...prev,
      message: "",
      submitError: "",
    }));

    const { password, confirmPassword } = formState;

    if (password !== confirmPassword) {
      setUiState((prev) => ({
        ...prev,
        submitError: "Passwords do not match.",
      }));
      return;
    }

    if (password.length < 8) {
      setUiState((prev) => ({
        ...prev,
        submitError: "Password must be at least 8 characters long.",
      }));
      return;
    }

    setUiState((prev) => ({ ...prev, loading: true }));

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password.");
      }

      setFormState((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));

      setUiState((prev) => ({
        ...prev,
        message: data.message + " Redirecting to login...",
        tokenCheckStatus: "invalid",
        tokenErrorMessage:
          "Password reset successfully. This link is no longer valid.",
      }));

      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      setUiState((prev) => ({
        ...prev,
        submitError: err.message || "An error occurred. Please try again.",
      }));
    } finally {
      setUiState((prev) => ({ ...prev, loading: false }));
    }
  };

  const renderPasswordField = (
    id,
    label,
    placeholder,
    value,
    showPassword,
    toggleField
  ) => {
    const { loading, submitError } = uiState;
    const hasError =
      submitError &&
      ((id === "password" && submitError.includes("least 8 characters")) ||
        submitError.includes("match"));

    return (
      <div className="space-y-1">
        <label
          htmlFor={id}
          className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1"
        >
          {label} <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="relative text-gray-900">
          <input
            id={id}
            name={id}
            type={showPassword ? "text" : "password"}
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            autoComplete="new-password"
            required
            disabled={loading}
            className={`w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-3 lg:py-4 rounded-lg border ${
              hasError
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-orange-500"
            } focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-xs sm:text-sm lg:text-base ${
              loading ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
            aria-invalid={!!submitError}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 sm:pl-3 pointer-events-none">
            <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </div>
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-2.5 sm:pr-3 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed z-10"
            onClick={() => togglePasswordVisibility(toggleField)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            disabled={loading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    const {
      tokenCheckStatus,
      tokenErrorMessage,
      message,
      submitError,
      loading,
    } = uiState;

    const { password, confirmPassword, showNewPassword, showConfirmPassword } =
      formState;

    if (tokenCheckStatus === "checking") {
      return (
        <div className="text-center p-10 text-gray-600">
          <svg
            className="animate-spin h-8 w-8 text-orange-500 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Verifying link...
        </div>
      );
    }

    if (tokenCheckStatus === "invalid") {
      return (
        <div className="text-center p-10">
          <p
            className={`${
              tokenErrorMessage.includes("Password reset successfully")
                ? "text-green-600 bg-green-100 border border-green-400"
                : "text-red-600 bg-red-100 border border-red-400"
            } p-4 rounded-md mb-6`}
          >
            {tokenErrorMessage || "This link is invalid or has expired."}
          </p>
          <Link
            href="/login"
            className="text-gray-600 hover:text-gray-800 font-medium mt-4 inline-block border border-orange-400 rounded-lg px-4 py-2 hover:bg-orange-50 transition-colors"
          >
            Back to Login
          </Link>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <p className="text-green-600 bg-green-100 p-3 rounded-md text-center">
            {message}
          </p>
        )}
        {submitError && (
          <p className="text-red-600 bg-red-100 p-3 rounded-md text-center">
            {submitError}
          </p>
        )}

        {!message && (
          <>
            {renderPasswordField(
              "password",
              "New Password",
              "Enter new password (min 8 chars)",
              password,
              showNewPassword,
              "showNewPassword"
            )}

            {renderPasswordField(
              "confirmPassword",
              "Confirm New Password",
              "Confirm your new password",
              confirmPassword,
              showConfirmPassword,
              "showConfirmPassword"
            )}

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="w-full flex justify-center items-center bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}

        {message && (
          <div className="text-center mt-4">
            <Link
              href="/login"
              className="text-orange-600 hover:text-orange-800 font-medium border border-orange-400 rounded-lg px-4 py-2 hover:bg-orange-50 transition-colors inline-block bg-orange-400"
            >
              Back to Login
            </Link>
          </div>
        )}
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <section className="flex flex-col items-center justify-center px-4 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 sm:text-3xl md:text-4xl">
              Reset Your Password
            </h2>
            {uiState.tokenCheckStatus !== "invalid" && (
              <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-md mx-auto">
                Enter your new password below.
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6 sm:p-8 md:p-10 border border-orange-100">
            {renderContent()}
          </div>
        </div>
      </section>
    </div>
  );
}
