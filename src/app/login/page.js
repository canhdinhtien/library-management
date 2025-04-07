import Navbar from "../../components/Navbar";
import Link from "next/link";
import Head from "next/head";

export const metadata = {
  title: "Login",
  description: "Trang đăng nhập",
};

export default function Login() {
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
              Please enter your credentials to access your account
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden p-8 sm:p-10 lg:p-12 border border-gray-100 transition-all duration-300 hover:shadow-xl">
            <div className="space-y-8">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1 lg:text-base">
                  Username
                </label>
                <div className="relative text-gray-900">
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    className="w-full px-4 py-3 lg:px-5 lg:py-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 text-sm lg:text-base"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 lg:text-base">
                    Password
                  </label>
                  <Link
                    href="/forgotpass"
                    className="text-xs text-yellow-600 hover:text-yellow-800 hover:underline font-medium lg:text-sm"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative text-gray-900">
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 lg:px-5 lg:py-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 text-sm lg:text-base"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 lg:text-base">
                  Remember me
                </label>
              </div>

              <button
                id="login"
                className="w-full bg-orange-400 text-white font-medium py-3 px-4 lg:py-4 lg:px-6 rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg text-sm lg:text-base"
              >
                Log in
              </button>

              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-600 lg:text-base">
                  Haven&apos;t got an account yet?{" "}
                  <Link
                    href="/register"
                    className="text-yellow-600 hover:text-yellow-800 hover:underline font-medium"
                  >
                    Create an Account
                  </Link>
                </p>

                <p className="text-xs text-gray-500 mt-4 lg:text-sm">
                  <Link
                    href="/"
                    className="hover:text-gray-700 hover:underline"
                  >
                    Back to main menu
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
