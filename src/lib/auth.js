export const logout = async () => {
  localStorage.removeItem("authToken");
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
};
