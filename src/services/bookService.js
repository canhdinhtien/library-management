export const fetchGenres = async () => {
  const res = await fetch("/api/genres");
  if (!res.ok) throw new Error("Failed to fetch genres");
  return res.json();
};

export const fetchAuthors = async () => {
  const res = await fetch("/api/authors");
  if (!res.ok) throw new Error("Failed to fetch authors");
  return res.json();
};

export const fetchBooks = async (query = {}) => {
  const params = new URLSearchParams(query);
  const res = await fetch(`/api/books?${params.toString()}`);
  if (!res.ok) {
    let errorData = { message: `HTTP error! status: ${res.status}` };
    try {
      errorData = await res.json();
    } catch {}
    throw new Error(errorData.error || errorData.message);
  }
  return res.json();
};
export async function getFeaturedBooks(token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch("/api/books?featured=true", { headers });

  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export const fetchFeaturedBooks = async (token) => {
  if (!token) {
    throw new Error("Authentication token is required.");
  }

  const response = await fetch("/api/books?featured=true", {
    headers: {
      Authorization: `Bearer ${token}`,

      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized: Invalid or expired token.");
    }

    let errorData = { message: `HTTP error! Status: ${response.status}` };
    try {
      const body = await response.json();
      if (body.error) {
        errorData.message = body.error;
      }
    } catch (e) {
      console.warn("Could not parse error response body as JSON.");
    }

    throw new Error(errorData.message);
  }

  try {
    const data = await response.json();
    return data;
  } catch (e) {
    console.error("Failed to parse books response:", e);
    throw new Error("Failed to parse response from server.");
  }
};
