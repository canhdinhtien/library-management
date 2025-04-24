import { useState } from "react";
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

// Map of icon strings to components
const iconComponents = {
  User: User,
  Mail: Mail,
  Lock: Lock,
  Calendar: Calendar,
  Phone: Phone,
  MapPin: MapPin,
  Hash: Hash,
};

export const InputField = ({
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
}) => {
  // Get the icon component based on the string name
  const IconComponent = typeof icon === "string" ? iconComponents[icon] : icon;

  return (
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
          {IconComponent && (
            <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          )}
        </div>
        {error && (
          <p id={`${id}-error`} className="text-red-500 text-xs mt-1">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export const PasswordField = ({
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
