import Navbar from "../../components/Navbar";
import Link from "next/link";

export const metadata = {
  title: "Sign In",
  description: "Trang đăng ký",
};

export default function Register() {
  return (
    <div className="m-2">
      <Navbar />
      <section className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-8 md:px-16">
        <h2 className="text-4xl text-black mb-8 text-center">Create Your Account</h2>
        <div className="w-full max-w-md space-y-6">
          {/* Name Fields */}
          <div className="flex flex-wrap justify-between gap-2 mb-6">
            <input
              type="text"
              placeholder="First name"
              className="border text-gray-400 p-2 pl-4 w-full sm:w-48 rounded-lg"
            />
            <input
              type="text"
              placeholder="Surname"
              className="border text-gray-400 p-2 pl-4 w-full sm:w-48 rounded-lg"
            />
          </div>

          {/* Date, Month, Year */}
          <div className="flex flex-wrap gap-2 mb-6">
            {/* Day */}
            <select className="border text-gray-400 p-2 rounded-lg w-full sm:w-32">
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>

            {/* Month */}
            <select className="border text-gray-400 p-2 rounded-lg w-full sm:w-32">
              {[
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ].map((month, i) => (
                <option key={i + 1} value={i + 1}>
                  {month}
                </option>
              ))}
            </select>

            {/* Year */}
            <select className="border text-gray-400 p-2 rounded-lg w-full sm:w-32">
              {Array.from({ length: 100 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Email, Username, Password Fields */}
          <div className="mb-5">
            <input
              type="email"
              placeholder="Enter your email"
              className="border text-gray-400 p-2 pl-4 mt-2 w-full rounded-lg"
            />
          </div>
          <div className="mb-5">
            <input
              type="text"
              placeholder="Enter your username"
              className="border text-gray-400 p-2 pl-4 mt-2 w-full rounded-lg"
            />
          </div>
          <div className="mb-5">
            <input
              type="password"
              placeholder="Enter your password"
              className="border text-gray-400 p-2 pl-4 mt-2 w-full rounded-lg"
            />
          </div>
          <div className="mb-5">
            <input
              type="password"
              placeholder="Verify your password"
              className="border text-gray-400 p-2 pl-4 mt-2 w-full rounded-lg"
            />
          </div>

          {/* Sign in Button */}
          <div className="mb-4">
            <button
              className="bg-yellow-500 text-white px-4 py-2 mt-4 w-full rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              Sign In
            </button>
          </div>
          
          {/* Link to Login */}
          <Link href="/login" className="text-blue-500 hover:underline text-center block">
            Already have an Account?
          </Link>
        </div>
      </section>
    </div>
  );
}
import Navbar from "../../components/Navbar";

export default function Register() {
  return (
    <div>
      <Navbar />
      <section className="flex flex-col items-center justify-center h-screen ">
        <h2 className="text-4xl text-black mb-10">Create Your Account</h2>
        <div className="w-100">
        <input
            type="text"
            placeholder="First name"
            className="border text-gray-400 p-2 pl-4 mt-4 mb-10 mr-2 rounded-lg"
          />
          <input
            type="text"
            placeholder="Surname"
            className="border text-gray-400 p-2 pl-4 mt-4 mb-10 rounded-lg"
          />
        </div>
        <div>
          <h3 className="text-lg font-bold text-black text-left">Password</h3>
          <input
            type="password"
            placeholder="Enter your password"
            className="border text-gray-400 p-2 pl-4 mt-4 mb-15 w-100 rounded-lg"
          />
        </div>
        <div>
          <button className="bg-yellow-500 text-white px-4 py-2 mt-4 w-100 rounded-xl">
            Login
          </button>
          <h3 className="text-md text-gray-500 text-left">Haven't got Account yet?</h3>
          <button className="bg-yellow-500 text-white px-4 py-2 mt-4 mb-6 w-100 rounded-xl">
            Create an Account
          </button>
          <Link
            href="/login"
            className="bg-yellow-500 text-white px-4 py-2 mt-4 mb-6 w-100 rounded-xl"
            >
            <span className="leading-none">Login</span>
            </Link>
        </div>

      </section>
    </div>
  );
}
