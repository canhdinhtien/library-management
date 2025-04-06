import Navbar from "../../components/Navbar";
import Link from "next/link";
import Head from "next/head";

export const metadata = {
  title: "Login",
  description: "Trang đăng nhập",
};

export default function Login() {
  return (
    <div className="m-2">
      <Navbar />
      <section className="flex flex-col items-center justify-center h-screen px-4 sm:px-8 md:px-16">
        <h2 className="text-4xl text-black mb-10 text-center">Login to Your Account</h2>
        <div className="w-full max-w-md">
          <div className="mb-5">
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              className="border text-gray-400 p-2 pl-4 w-full rounded-lg"
            />
          </div>
          <div className="mb-10">
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="border text-gray-400 p-2 pl-4 w-full rounded-lg"
            />
          </div>
          <div>
            <button
              id="login"
              className="bg-yellow-500 text-white px-4 py-2 w-full rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              Log in
            </button>
            <p className="text-md text-gray-500 text-left mt-4">
              <Link href="/fogotpass" className="text-blue-500 hover:underline">
                Forgotten account?
              </Link>
              <br />
              Haven&apos;t got an account yet? 
              <Link href="/register" className="text-blue-500 hover:underline">
                Create an Account
              </Link>
              <br />
              Don&apos;t want to log in? 
              <Link href="/" className="text-blue-500 hover:underline">
                Back to main menu
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}