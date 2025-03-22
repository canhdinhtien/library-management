import Navbar from "../../components/Navbar";

export default function Login() {
  return (
    <div>
      <Navbar />
      <section className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold">Login to Your Account</h2>
        <input
          type="text"
          placeholder="Username"
          className="border p-2 mt-4 w-80"
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 mt-4 w-80"
        />
        <button className="bg-yellow-500 text-white px-4 py-2 mt-4 rounded">
          Login
        </button>
      </section>
    </div>
  );
}
