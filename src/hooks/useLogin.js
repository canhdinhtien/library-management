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
        login(data.user, data.token);
        console.log("Login page: Context updated, redirecting...");

        if (data.user?.role === "employee") {
          router.push("/admin/dashboard");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(data.message || "Username or password is incorrect.");
        setIsLoading(false);
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
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
