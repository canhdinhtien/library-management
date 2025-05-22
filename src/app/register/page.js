"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Calendar,
  Phone,
  MapPin,
  Hash,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/navigation";
// import { toast } from "sonner";

const InputField = ({
  id,
  label,
  type = "text",
  icon,
  placeholder,
  autoComplete,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  inputMode,
  maxLength,
}) => (
  <div className="space-y-1">
    <label
      htmlFor={id}
      className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1"
    >
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="relative text-gray-900">
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        inputMode={inputMode}
        className={`w-full pl-8 sm:pl-10 pr-3 py-2 sm:py-3 lg:py-4 rounded-lg border ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-yellow-500"
        } focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-xs sm:text-sm lg:text-base ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        maxLength={maxLength || (type === "date" ? 10 : undefined)}
      />
      <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 sm:pl-3 pointer-events-none">
        {icon}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-red-500 text-xs mt-1">
          {error}
        </p>
      )}
    </div>
  </div>
);

const PasswordField = ({
  id,
  label,
  value,
  onChange,
  error,
  showPassword,
  setShowPassword,
  required = false,
  disabled = false,
  placeholder,
}) => (
  <div className="space-y-1">
    <label
      htmlFor={id}
      className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1"
    >
      {label} {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="relative text-gray-900">
      <input
        id={id}
        name={id}
        type={showPassword ? "text" : "password"}
        placeholder={
          placeholder ||
          (id === "password"
            ? "Create a password (min 8 chars)"
            : "Verify password")
        }
        value={value}
        onChange={onChange}
        autoComplete={id === "password" ? "new-password" : "new-password"}
        required={required}
        disabled={disabled}
        className={`w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-3 lg:py-4 rounded-lg border ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-yellow-500"
        } focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-xs sm:text-sm lg:text-base ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 sm:pl-3 pointer-events-none">
        <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
      </div>
      <button
        type="button"
        className="absolute inset-y-0 right-0 flex items-center pr-2.5 sm:pr-3 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => !disabled && setShowPassword(!showPassword)}
        aria-label={showPassword ? "Hide password" : "Show password"}
        disabled={disabled}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
        ) : (
          <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </button>
      {error && (
        <p id={`${id}-error`} className="text-red-500 text-xs mt-1">
          {error}
        </p>
      )}
    </div>
  </div>
);

export default function Register() {
  const initialFormData = {
    firstName: "",
    surname: "",
    email: "",
    address: "",
    phone: "",
    dob: "",
    username: "",
    password: "",
    verifyPassword: "",
  };
  const [formData, setFormData] = useState(initialFormData);
  const [otp, setOtp] = useState("");
  const [registrationStage, setRegistrationStage] = useState("form");

  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [otpError, setOtpError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ message: "", type: "" });
  const router = useRouter();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => {
        const ne = { ...prev };
        delete ne[id];
        return ne;
      });
    }
    if (submitStatus.type === "error") {
      setSubmitStatus({ message: "", type: "" });
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setOtp(value.slice(0, 6));
    if (otpError) setOtpError("");
    if (submitStatus.type === "error") {
      setSubmitStatus({ message: "", type: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const required = [
      "firstName",
      "surname",
      "email",
      "username",
      "password",
      "verifyPassword",
    ];
    required.forEach((f) => {
      if (!formData[f]?.trim()) newErrors[f] = "Required";
    });
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Invalid email";
    if (formData.username && !/^[a-zA-Z0-9_]{3,20}$/.test(formData.username))
      newErrors.username = "Invalid username (3-20 chars, a-z, 0-9, _)";
    if (formData.password && formData.password.length < 8)
      newErrors.password = "Min 8 chars";
    if (
      formData.password !== formData.verifyPassword &&
      (formData.password || formData.verifyPassword)
    )
      newErrors.verifyPassword = "Passwords don't match";
    if (
      formData.phone &&
      formData.phone.trim() &&
      !/^\+?[\d\s-()]{7,20}$/.test(formData.phone)
    )
      newErrors.phone = "Invalid phone";
    return newErrors;
  };

  // --- API Call Handlers ---
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ message: "", type: "" });
    setErrors({});
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/register-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSubmitStatus({ message: data.message, type: "info" }); // 'info' for OTP sent
        setRegistrationStage("otp");
        setErrors({});
      } else {
        if (data.errors) setErrors(data.errors);
        setSubmitStatus({
          message: data.message || "Registration failed.",
          type: "error",
        });
      }
    } catch (error) {
      setSubmitStatus({ message: "Network error.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ message: "", type: "" });
    setOtpError("");
    if (!otp || otp.length !== 6) {
      setOtpError("Enter 6-digit OTP.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSubmitStatus({
          message: `${data.message} Redirecting...`,
          type: "success",
        });
        setFormData(initialFormData);
        setOtp("");
        setTimeout(() => {
          router.push("/login");
        }, 2500);
      } else {
        setOtpError(data.message || "OTP verification failed.");
      }
    } catch (error) {
      setOtpError("Network error during verification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBackToForm = () => {
    setRegistrationStage("form");
    setSubmitStatus({ message: "", type: "" });
    setOtp("");
    setOtpError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <section className="flex flex-col items-center justify-center px-4 py-10 sm:px-6 sm:py-12 md:px-8 lg:py-20">
        <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-1 sm:mb-2">
              Create Account
            </h2>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg lg:text-xl">
              Join our community and get started
            </p>
          </div>

          {registrationStage === "form" && (
            <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg overflow-hidden p-5 sm:p-6 md:p-8 lg:p-12 border border-gray-100 transition-all duration-300 hover:shadow-xl">
              {submitStatus.message && submitStatus.type === "error" && (
                <div
                  className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-red-50 text-red-700 text-xs sm:text-sm"
                  role="alert"
                >
                  {submitStatus.message}
                </div>
              )}

              <form
                className="space-y-4 sm:space-y-5 md:space-y-6"
                onSubmit={handleRegisterSubmit}
                noValidate
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                  <InputField
                    id="firstName"
                    label="First Name"
                    icon={
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    }
                    value={formData.firstName}
                    onChange={handleChange}
                    error={errors.firstName}
                    required={true}
                    placeholder="Enter your first name"
                  />
                  <InputField
                    id="surname"
                    label="Surname"
                    icon={
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    }
                    value={formData.surname}
                    onChange={handleChange}
                    error={errors.surname}
                    required={true}
                    placeholder="Enter your surname"
                  />
                </div>

                <InputField
                  id="email"
                  label="Email Address"
                  type="email"
                  icon={
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  }
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required={true}
                  placeholder="Enter your email address"
                />

                <InputField
                  id="address"
                  label="Address"
                  icon={
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  }
                  value={formData.address}
                  onChange={handleChange}
                  error={errors.address}
                  required={true}
                  placeholder="Enter your address"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                  <InputField
                    id="phone"
                    label="Phone"
                    type="tel"
                    icon={
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    }
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    inputMode="tel"
                    required={true}
                    placeholder="Enter your phone number"
                  />
                  <InputField
                    id="dob"
                    label="Date of Birth"
                    type="date"
                    icon={
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    }
                    value={formData.dob}
                    onChange={handleChange}
                    required={true}
                    error={errors.dob}
                  />
                </div>

                <InputField
                  id="username"
                  label="Username"
                  icon={
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  }
                  value={formData.username}
                  onChange={handleChange}
                  error={errors.username}
                  required={true}
                  placeholder="Choose a username"
                />

                <PasswordField
                  id="password"
                  label="Password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  required={true}
                  placeholder="Create a password (min 8 chars)"
                />

                <PasswordField
                  id="verifyPassword"
                  label="Verify Password"
                  value={formData.verifyPassword}
                  onChange={handleChange}
                  error={errors.verifyPassword}
                  showPassword={showVerifyPassword}
                  setShowPassword={setShowVerifyPassword}
                  required={true}
                  placeholder="Verify your password"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-400 text-white font-medium py-2.5 sm:py-3 md:py-3.5 lg:py-4 px-4 lg:px-6 rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg text-sm lg:text-base mt-2"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white"
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
                      Creating Account...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </button>

                <div className="relative py-2 sm:py-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xs sm:text-sm md:text-base text-gray-600">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="text-yellow-600 hover:text-yellow-800 hover:underline font-medium"
                    >
                      Log in
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          )}

          {registrationStage === "otp" && (
            <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg overflow-hidden p-5 sm:p-6 md:p-8 lg:p-12 border border-gray-100 transition-all duration-300 hover:shadow-xl">
              <div className="text-center mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Verify Your Email
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Enter the verification code sent to{" "}
                  <span className="font-medium text-gray-800 break-all">
                    {formData.email}
                  </span>
                </p>
              </div>

              {submitStatus.message &&
                (submitStatus.type === "info" ||
                  submitStatus.type === "success") && (
                  <div
                    className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg text-xs sm:text-sm ${
                      submitStatus.type === "success"
                        ? "bg-green-50 text-green-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                    role="alert"
                  >
                    {submitStatus.message}
                  </div>
                )}

              {otpError && (
                <div
                  className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-red-50 text-red-700 text-xs sm:text-sm"
                  role="alert"
                >
                  {otpError}
                </div>
              )}

              <form
                className="space-y-4 sm:space-y-5 md:space-y-6"
                onSubmit={handleOtpSubmit}
                noValidate
              >
                <InputField
                  id="otp"
                  label="Verification Code"
                  type="text"
                  icon={
                    <Hash className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  }
                  value={otp}
                  onChange={handleOtpChange}
                  error={null}
                  required={true}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  maxLength={6}
                  disabled={isSubmitting || submitStatus.type === "success"}
                  placeholder="Enter 6-digit code"
                />

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !otp ||
                    otp.length !== 6 ||
                    submitStatus.type === "success"
                  }
                  className="w-full bg-orange-400 text-white font-medium py-2.5 sm:py-3 md:py-3.5 lg:py-4 px-4 lg:px-6 rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg text-sm lg:text-base disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white"
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
                      Verifying...
                    </div>
                  ) : (
                    "Verify Account"
                  )}
                </button>

                <div className="text-center mt-3 sm:mt-4">
                  <button
                    type="button"
                    onClick={goBackToForm}
                    className="text-yellow-600 hover:text-yellow-800 hover:underline text-xs sm:text-sm font-medium disabled:text-gray-400 disabled:no-underline disabled:hover:text-gray-400"
                    disabled={isSubmitting || submitStatus.type === "success"}
                  >
                    Go back to registration
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
