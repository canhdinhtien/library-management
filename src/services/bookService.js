// export const fetchGenres = async () => {
//   const res = await fetch("/api/genres");
//   if (!res.ok) throw new Error("Failed to fetch genres");
//   return res.json();
// };

// export const fetchAuthors = async () => {
//   const res = await fetch("/api/authors");
//   if (!res.ok) throw new Error("Failed to fetch authors");
//   return res.json();
// };

// export const fetchBooks = async (query = {}) => {
//   const params = new URLSearchParams(query);
//   const res = await fetch(`/api/books?${params.toString()}`);
//   if (!res.ok) {
//     let errorData = { message: `HTTP error! status: ${res.status}` };
//     try {
//       errorData = await res.json();
//     } catch {}
//     throw new Error(errorData.error || errorData.message);
//   }
//   return res.json();
// };
// export async function getFeaturedBooks(token) {
//   const headers = token ? { Authorization: `Bearer ${token}` } : {};
//   const res = await fetch("/api/books?featured=true", { headers });

//   if (!res.ok) throw new Error(`HTTP error ${res.status}`);
//   return res.json();
// }

// export const fetchFeaturedBooks = async (token) => {
//   if (!token) {
//     throw new Error("Authentication token is required.");
//   }

//   const response = await fetch("/api/books?featured=true", {
//     headers: {
//       Authorization: `Bearer ${token}`,

//       "Content-Type": "application/json",
//     },
//   });

//   if (!response.ok) {
//     if (response.status === 401) {
//       throw new Error("Unauthorized: Invalid or expired token.");
//     }

//     let errorData = { message: `HTTP error! Status: ${response.status}` };
//     try {
//       const body = await response.json();
//       if (body.error) {
//         errorData.message = body.error;
//       }
//     } catch (e) {
//       console.warn("Could not parse error response body as JSON.");
//     }

//     throw new Error(errorData.message);
//   }

//   try {
//     const data = await response.json();
//     return data;
//   } catch (e) {
//     console.error("Failed to parse books response:", e);
//     throw new Error("Failed to parse response from server.");
//   }
// };
export const fetchGenres = async () => {
  try {
    const res = await fetch("/api/genres"); // Giả sử API này được bảo vệ bởi middleware nếu cần token
    if (!res.ok) {
      // Cố gắng parse lỗi từ server nếu có
      let errorDetail = `HTTP error! status: ${res.status}`;
      try {
        const errorData = await res.json();
        errorDetail = errorData.message || errorData.error || errorDetail;
      } catch (e) {
        /* Bỏ qua nếu không parse được */
      }
      throw new Error(errorDetail);
    }
    const responseData = await res.json();
    // Giả sử API trả về { success: true, data: ['Fiction', 'Science', ...] }
    if (
      responseData &&
      responseData.success &&
      Array.isArray(responseData.data)
    ) {
      return responseData.data; // << TRẢ VỀ MẢNG DATA
    } else if (Array.isArray(responseData)) {
      // Nếu API trả về trực tiếp mảng
      return responseData;
    } else {
      console.error(
        "API response for genres is not in expected format (expected {success: true, data: [...] } or array):",
        responseData
      );
      return []; // Trả về mảng rỗng nếu dữ liệu không đúng
    }
  } catch (error) {
    console.error("Error in fetchGenres (bookService):", error.message);
    throw error; // Ném lại lỗi để useBookCatalog có thể xử lý (ví dụ: setOptionsLoadingError)
  }
};

export const fetchAuthors = async () => {
  try {
    const res = await fetch("/api/authors"); // Giả sử API này được bảo vệ bởi middleware nếu cần token
    if (!res.ok) {
      let errorDetail = `HTTP error! status: ${res.status}`;
      try {
        const errorData = await res.json();
        errorDetail = errorData.message || errorData.error || errorDetail;
      } catch (e) {
        /* Bỏ qua */
      }
      throw new Error(errorDetail);
    }
    const responseData = await res.json();
    // Giả sử API trả về { success: true, data: [{name: 'Author A'}, ...] }
    if (
      responseData &&
      responseData.success &&
      Array.isArray(responseData.data)
    ) {
      // Nếu bạn muốn authorOptions là mảng các TÊN tác giả:
      return responseData.data.map((author) => author.name); // << TRẢ VỀ MẢNG TÊN
      // Hoặc nếu bạn muốn authorOptions là mảng các OBJECT tác giả (để có thể dùng ID sau này):
      // return responseData.data;
    } else if (Array.isArray(responseData)) {
      // Nếu API trả về trực tiếp mảng các object tác giả
      return responseData.map((author) => author.name); // Hoặc return responseData;
    } else {
      console.error(
        "API response for authors is not in expected format (expected {success: true, data: [...] } or array):",
        responseData
      );
      return [];
    }
  } catch (error) {
    console.error("Error in fetchAuthors (bookService):", error.message);
    throw error;
  }
};

export const fetchBooks = async (query = {}) => {
  try {
    const params = new URLSearchParams(query);
    const res = await fetch(`/api/books?${params.toString()}`); // Giả sử API này được bảo vệ bởi middleware nếu cần token
    if (!res.ok) {
      let errorData = { message: `HTTP error! status: ${res.status}` };
      try {
        const parsedError = await res.json();
        // Giả sử API lỗi trả về { success: false, message: "...", error: "..." }
        errorData.message =
          parsedError.message || parsedError.error || errorData.message;
      } catch {}
      throw new Error(errorData.message);
    }
    const responseData = await res.json();
    // Giả sử API trả về { success: true, data: booksArray }
    if (
      responseData &&
      responseData.success &&
      Array.isArray(responseData.data)
    ) {
      return responseData.data; // << TRẢ VỀ MẢNG DATA
    } else if (Array.isArray(responseData)) {
      return responseData;
    } else {
      console.error(
        "API response for books is not in expected format (expected {success: true, data: [...] } or array):",
        responseData
      );
      return [];
    }
  } catch (error) {
    console.error("Error in fetchBooks (bookService):", error.message);
    throw error; // Ném lại lỗi để useBookCatalog có thể xử lý
  }
};

// Hàm getFeaturedBooks và fetchFeaturedBooks có vẻ lặp lại, chọn một hàm để dùng.
// Dưới đây là phiên bản gộp và cải thiện của fetchFeaturedBooks

export const getAndParseFeaturedBooks = async (token) => {
  // Đổi tên để rõ ràng hơn
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  // Không cần 'Content-Type': 'application/json' cho GET request

  try {
    const response = await fetch("/api/books?featured=true", { headers });

    if (!response.ok) {
      let errorMessage = `HTTP error! Status: ${response.status}`;
      if (response.status === 401) {
        errorMessage = "Unauthorized: Invalid or expired token.";
      } else {
        try {
          const body = await response.json();
          errorMessage = body.message || body.error || errorMessage;
        } catch (e) {
          // Giữ errorMessage mặc định nếu không parse được JSON
        }
      }
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    // Giả sử API trả về { success: true, data: booksArray }
    if (
      responseData &&
      responseData.success &&
      Array.isArray(responseData.data)
    ) {
      return responseData.data; // << TRẢ VỀ MẢNG DATA
    } else if (Array.isArray(responseData)) {
      return responseData;
    } else {
      console.error(
        "API response for featured books is not in expected format:",
        responseData
      );
      throw new Error(
        "Featured books data from server is not in expected format."
      );
    }
  } catch (error) {
    console.error(
      "Error in getAndParseFeaturedBooks (bookService):",
      error.message
    );
    throw error;
  }
};
