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
