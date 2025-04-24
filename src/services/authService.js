export const loginUser = async (username, password) => {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data?.message || "Username or password incorrect.";
    throw new Error(errorMessage);
  }

  if (data.success === false) {
    throw new Error(
      data.message || "Login failed due to an unknown server issue."
    );
  }

  if (!data.user || !data.token) {
    console.error("API success response missing user or token:", data);
    throw new Error(
      "Login successful, but received incomplete data from server."
    );
  }

  return { user: data.user, token: data.token };
};

export const registerUser = async (formData) => {
  try {
    const response = await fetch("/api/auth/register-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    return {
      success: response.ok && data.success,
      message: data.message || "Registration failed",
      errors: data.errors || {},
    };
  } catch (error) {
    return {
      success: false,
      message: "Network error occurred",
      errors: {},
    };
  }
};

export const verifyOtp = async (email, otp) => {
  try {
    const response = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();
    return {
      success: response.ok && data.success,
      message: data.message || "OTP verification failed",
    };
  } catch (error) {
    return {
      success: false,
      message: "Network error during verification",
    };
  }
};
