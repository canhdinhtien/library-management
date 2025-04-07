"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Eye, EyeOff, User, Mail, Lock, Calendar } from "lucide-react"
import Navbar from "../../components/Navbar"

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [showVerifyPassword, setShowVerifyPassword] = useState(false)

  // State for date of birth
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedDay, setSelectedDay] = useState("")
  const [daysInMonth, setDaysInMonth] = useState([])

  // Generate years (100 years from current year)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString())

  // Months array
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  // Calculate days in month based on selected year and month
  useEffect(() => {
    if (selectedYear && selectedMonth) {
      // Convert to numbers for calculation
      const year = Number.parseInt(selectedYear)
      const month = Number.parseInt(selectedMonth)

      // Calculate days in the selected month
      // Month in JavaScript is 0-indexed (0 = January, 11 = December)
      const daysCount = new Date(year, month, 0).getDate()

      // Create array of days
      const daysArray = Array.from({ length: daysCount }, (_, i) => (i + 1).toString())
      setDaysInMonth(daysArray)

      // Reset selected day if it's greater than days in month
      if (selectedDay && Number.parseInt(selectedDay) > daysCount) {
        setSelectedDay("")
      }
    } else {
      setDaysInMonth([])
      setSelectedDay("")
    }
  }, [selectedYear, selectedMonth, selectedDay])

  // Handle year change
  const handleYearChange = (e) => {
    setSelectedYear(e.target.value)
    setSelectedMonth("")
    setSelectedDay("")
  }

  // Handle month change
  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value)
    setSelectedDay("")
  }

  // Handle day change
  const handleDayChange = (e) => {
    setSelectedDay(e.target.value)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-blue-50 to-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <section className="flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">Create Account</h2>
              <p className="text-gray-500 text-lg">Join our community today</p>
            </div>

            <form className="space-y-5">
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="block text-base font-medium text-gray-700">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-400" />
                    </div>
                    <input
                      id="firstName"
                      type="text"
                      placeholder="Your first name"
                      className="w-full pl-10 pr-3 py-3 rounded-lg border border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-colors text-gray-700 outline-none text-base"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="surname" className="block text-base font-medium text-gray-700">
                    Surname
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-400" />
                    </div>
                    <input
                      id="surname"
                      type="text"
                      placeholder="Your surname"
                      className="w-full pl-10 pr-3 py-3 rounded-lg border border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-colors text-gray-700 outline-none text-base"
                    />
                  </div>
                </div>
              </div>

              {/* Date of Birth - Sequential selection */}
              

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-base font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-3 py-3 rounded-lg border border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-colors text-gray-700 outline-none text-base"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-base font-medium text-gray-700">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    className="w-full pl-10 pr-3 py-3 rounded-lg border border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-colors text-gray-700 outline-none text-base"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-base font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-colors text-gray-700 outline-none text-base"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Verify Password */}
              <div className="space-y-2">
                <label htmlFor="verifyPassword" className="block text-base font-medium text-gray-700">
                  Verify Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="verifyPassword"
                    type={showVerifyPassword ? "text" : "password"}
                    placeholder="Verify password"
                    className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-colors text-gray-700 outline-none text-base"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    onClick={() => setShowVerifyPassword(!showVerifyPassword)}
                    aria-label={showVerifyPassword ? "Hide password" : "Show password"}
                  >
                    {showVerifyPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Sign Up Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3.5 px-4 rounded-xl text-lg transition-all duration-200 transform hover:translate-y-[-2px] active:translate-y-0 shadow-md hover:shadow-lg active:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Create Account
                </button>
              </div>
            </form>

            {/* Link to Login */}
            <div className="mt-8 text-center">
              <p className="text-base text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 font-medium hover:text-blue-800 transition-colors underline-offset-2 hover:underline"
                >
                  Log in
                </Link>
              </p>
            </div>

            {/* Optional: Terms and Privacy */}
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

