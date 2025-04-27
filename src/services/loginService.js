export const loginService = async (username, password) => {
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    return { response, data };
  } catch (err) {
    throw new Error("An error occurred. Please try again later.");
  }
};
