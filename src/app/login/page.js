import Navbar from "../../components/Navbar";

export default function Login() {
  return (
    <div>
      <Navbar />
      <section className="flex flex-col items-center justify-center h-screen ">
        <h2 className="text-4xl text-black mb-10">Login to Your Account</h2>
        <div>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            className="border text-gray-400 p-2 pl-4 mb-5 w-100 rounded-lg"
          />
        </div>
        <div>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            className="border text-gray-400 p-2 pl-4 mb-10 w-100 rounded-lg"
          />
        </div>
        <div>
          <button id="login" className="bg-yellow-500 text-white px-4 py-2 mb-4 w-100 rounded-xl">
            Log in
          </button>
          <p className="text-md text-gray-500 text-left px-4 py-2">
            <Link href="/fogotpass" className="text-blue-500 hover:underline">
              Foggoten account?
            </Link>
            <br></br>
            Haven't got Account yet? 
            <Link href="/register" className="text-blue-500 hover:underline">
              Create an Account
            </Link>
            <br></br>
            Don't want to login?
            <Link href="/" className="text-blue-500 hover:underline">
              Back to main menu
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
{/* <script>
  document.getElementById("login").addEventListener("click", function() {
    let name = document.getElementById("username").value.trim();
    let pass = document.getElementById("password").value.trim();
  }
</script> */}