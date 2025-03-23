import Navbar from "../../components/Navbar";

export default function Login() {
  return (
    <div>
      <Navbar />
      <section className="flex flex-col items-center justify-center h-screen ">
        <h2 className="text-4xl text-black mb-10">Login to Your Account</h2>
        <div>
          <h3 className="text-lg font-bold text-black text-left">Username</h3>
          <input
            type="text"
            placeholder="Enter your username"
            className="border text-gray-400 p-2 pl-4 mt-4 mb-10 w-100 rounded-lg"
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
        </div>

      </section>
    </div>
  );
}
