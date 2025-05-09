import { useState } from "react";
import { registerUser, verifyOtp } from "../services/authService";
import { validateRegistrationForm } from "../utils/validation";

/**
 * Custom hook for handling the registration process
 * @param {Object} router - Next.js router object
 * @returns {Object} Registration state and methods
 */
export const useRegistration = (router) => {
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

  // State management
  const [formData, setFormData] = useState(initialFormData);
  const [otp, setOtp] = useState("");
  const [registrationStage, setRegistrationStage] = useState("form");
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [otpError, setOtpError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ message: "", type: "" });

  /**
   * Handle form field changes
   * @param {Object} e - Event object
   */
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    // Clear errors when user starts typing
    if (errors[id]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }

    // Clear error message when user makes changes
    if (submitStatus.type === "error") {
      setSubmitStatus({ message: "", type: "" });
    }
  };

  /**
   * Handle OTP input changes
   * @param {Object} e - Event object
   */
  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setOtp(value.slice(0, 6));

    // Clear errors when user starts typing
    if (otpError) setOtpError("");
    if (submitStatus.type === "error") {
      setSubmitStatus({ message: "", type: "" });
    }
  };

  /**
   * Handle registration form submission
   * @param {Object} e - Event object
   */
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ message: "", type: "" });
    setErrors({});

    // Validate form
    const formErrors = validateRegistrationData(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerUser(formData);

      if (result.success) {
        setSubmitStatus({ message: result.message, type: "info" });
        setRegistrationStage("otp");
        setErrors({});
      } else {
        if (result.errors) setErrors(result.errors);
        setSubmitStatus({
          message: result.message,
          type: "error",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle OTP verification submission
   * @param {Object} e
   */
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ message: "", type: "" });
    setOtpError("");

    // Validate OTP
    if (!otp || otp.length !== 6) {
      setOtpError("Enter 6-digit OTP.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await verifyOtp(formData.email, otp);

      if (result.success) {
        setSubmitStatus({
          message: `${result.message} Redirecting...`,
          type: "success",
        });
        setFormData(initialFormData);
        setOtp("");

        setTimeout(() => {
          router.push("/login");
        }, 2500);
      } else {
        setOtpError(result.message);
      }
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

  return {
    formData,
    otp,
    registrationStage,
    errors,
    otpError,
    isSubmitting,
    submitStatus,
    showPassword,
    showVerifyPassword,
    handleChange,
    handleOtpChange,
    handleRegisterSubmit,
    handleOtpSubmit,
    goBackToForm,
    setShowPassword,
    setShowVerifyPassword,
  };
};
