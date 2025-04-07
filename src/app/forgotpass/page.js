import Navbar from "../../components/Navbar"
import Link from "next/link"

export const metadata = {
  title: "Forgotten Password",
  description: "Trang lấy lại mật khẩu",
}

export default function ForgotPass() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <section className="flex flex-col items-center justify-center px-4 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="w-full max-w-md sm:max-w-lg lg:max-w-2xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 sm:text-3xl md:text-4xl">
              Password Recovery
            </h2>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-md mx-auto">
              Please enter your email address to receive a password reset link.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6 sm:p-8 md:p-10 border border-orange-100 transition-all duration-300">
            <form className="space-y-6 sm:space-y-8">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 sm:text-base">
                  Recovery email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400 sm:h-6 sm:w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="example@domain.com"
                    className="block w-full pl-10 pr-4 py-2 text-sm sm:pl-12 sm:pr-4 sm:py-3 sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200 text-gray-900"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 sm:text-sm">
                  We will send a password reset link to this email
                </p>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base font-medium rounded-lg transition-all duration-200 transform hover:translate-y-[-2px] active:translate-y-[1px] shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 sm:h-6 sm:w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                Send Password Reset Link
              </button>

              <div className="relative py-3 sm:py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-xs text-gray-500 sm:px-6 sm:text-sm">
                    Or
                  </span>
                </div>
              </div>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 sm:h-6 sm:w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 17l-5-5m0 0l5-5m-5 5h12"
                    />
                  </svg>
                  Back to Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

