import Navbar from "../../components/Navbar";
import Link from "next/link";

export const metadata = {
  title: "Sign In",
  description: "Trang đăng ký",
};

export default function Register() {
  return (
    <div>
      <Navbar />
      <section className="flex flex-col items-center justify-center  h-screen ">
        <h2 className="text-4xl text-black mb-10">Create Your Account</h2>
        <div>
            <div className="w-100 mb-8">
                <input
                    type="text"
                    placeholder="First name"
                    className="border text-gray-400 p-2 pl-4 w-49 mr-2 rounded-lg"
                />
                <input
                    type="text"
                    placeholder="Surname"
                    className="border text-gray-400 p-2 pl-4 w-49 rounded-lg"
                />
            </div>

            <div className="flex space-x-2 w-full mb-5">
              {/* Ngày */}
              <select className="border text-gray-400 p-2 rounded-lg flex-1">
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>

              {/* Tháng */}
              <select className="border text-gray-400 p-2 rounded-lg flex-1">
                {[
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ].map((month, i) => (
                  <option key={i + 1} value={i + 1}>
                    {month}
                  </option>
                ))}
              </select>

              {/* Năm */}
              <select className="border text-gray-400 p-2 rounded-lg flex-1">
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

            <div class=" mb-5">
            <input
                type="text"
                placeholder="Enter your username"
                className="border text-gray-400 p-2 pl-4 mt-4 w-100 rounded-lg"
            />
            </div>
            <div class=" mb-5">
            <input
                type="password"
                placeholder="Enter your password"
                className="border text-gray-400 p-2 pl-4 mt-4 w-100 rounded-lg"
            />
            </div>
          </div>
        
        <div>
          <button className="bg-yellow-500 text-white px-4 py-2 mt-4 mb-4 w-100 rounded-xl">
            Sign in
          </button>
          <Link href="/login" className="text-blue-500 hover:underline block">
            Already have an Account?
          </Link>
        </div>
      </section>
    </div>
  );
}