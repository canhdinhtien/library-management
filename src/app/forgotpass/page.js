import Navbar from "../../components/Navbar";
import Link from "next/link";
import Head from "next/head";

export const metadata = {
  title: "Forgotten Password",
  description: "Trang lấy lại mật khẩu",
};

export default function ForgotPass() {
  return (
    <div className="m-2">
      <Navbar />
      <section className="flex flex-col items-center justify-center h-screen px-4 sm:px-8 md:px-16">
        <h2 className="text-4xl text-black mb-10 text-center">
          Chọn cách bạn muốn lấy lại tài khoản
        </h2>
        
        {/* Option buttons for recovery methods */}
        <div className="w-full max-w-md">
          <div className="mb-5">
            <button className="bg-blue-500 text-white px-6 py-3 w-full rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95">
              Email
            </button>
          </div>
          <div className="mb-5">
            <button className="bg-green-500 text-white px-6 py-3 w-full rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95">
              SMS
            </button>
          </div>
          <div className="mb-5">
            <button className="bg-yellow-500 text-white px-6 py-3 w-full rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95">
              Answer Security Question
            </button>
          </div>
        </div>

        {/* Link to go back to login page */}
        <div className="mt-6">
          <Link href="/login" className="text-blue-500 hover:underline block text-center">
            Back to Login Page
          </Link>
        </div>
      </section>
    </div>
  );
}