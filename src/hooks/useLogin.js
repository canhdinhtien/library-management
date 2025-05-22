import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { loginService } from "@/services/loginService";

export const useLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { response, data } = await loginService(username, password);

      if (response.ok && data.success) {
        console.log("Login page: API success, calling context login...");
        login(data.user, data.accessToken);
        console.log("Login page: Context updated, redirecting...");

        const userRole = data.user?.role;

        if (userRole === "admin") {
          router.push("/staff/admin-dashboard");
        } else if (userRole === "employee") {
          router.push("/staff/staff-dashboard");
        } else if (userRole === "member") {
          router.push("/dashboard");
        } else {
          console.warn(
            `Unknown role '${userRole}', redirecting to default dashboard.`
          );
          router.push("/dashboard");
        }
      } else {
        setError(data.message || "Username or password is incorrect.");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    username,
    password,
    setUsername,
    setPassword,
    error,
    isLoading,
    handleLogin,
  };
};
