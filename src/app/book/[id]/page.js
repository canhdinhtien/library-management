"use client";

import Navbar from "../../../components/Navbar";

import { useState, useEffect } from "react";
import { use } from "react";
import { jwtDecode } from "jwt-decode";

function Review({ reviews, book }) {
  // Kiểm tra nếu `reviews` không phải là mảng hoặc rỗng
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Community Reviews
        </h2>
        <div className="flex flex-col items-center mt-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="url(#starGradient)" // Gradient màu sắc
            stroke="#ffdd00"
            strokeWidth="1.5"
            className="w-16 h-16 text-gray-400 mb-4 transition-transform transform hover:scale-110" // Hiệu ứng hover
          >
            <defs>
              <linearGradient
                id="starGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#ffdd00" />
              </linearGradient>
            </defs>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            />
          </svg>
          <p className="text-gray-600 text-lg font-medium">
            No reviews available for this book.
          </p>
          <p className="text-gray-500 mt-2">
            Be the first to leave a review and share your thoughts!
          </p>
        </div>
      </div>
    );
  }

  // Tính điểm đánh giá trung bình
  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900">Community Reviews</h2>
      <div className="flex items-center mt-4 space-x-2">
        {/* Hiển thị các ngôi sao */}
        <div className="flex items-center">
          {Array.from({ length: 5 }, (_, index) => {
            const starValue = index + 1;
            const isFullStar = starValue <= averageRating;
            const isThreeQuarterStar =
              starValue - 0.25 <= averageRating && starValue > averageRating;
            const isHalfStar =
              starValue - 0.5 <= averageRating && starValue > averageRating;
            const isQuarterStar =
              starValue - 0.75 <= averageRating && starValue > averageRating;

            return (
              <svg
                key={index}
                xmlns="http://www.w3.org/2000/svg"
                fill={
                  isFullStar
                    ? "#fbbf24"
                    : isThreeQuarterStar
                    ? "url(#threeQuarterGradient)"
                    : isHalfStar
                    ? "url(#halfGradient)"
                    : isQuarterStar
                    ? "url(#quarterGradient)"
                    : "none"
                }
                stroke="#fbbf24"
                strokeWidth="2"
                className="w-8 h-8"
                viewBox="0 0 24 24"
              >
                {/* Gradient cho sao 3/4 */}
                {isThreeQuarterStar && (
                  <defs>
                    <linearGradient id="threeQuarterGradient">
                      <stop offset="75%" stopColor="#fbbf24" />
                      <stop offset="75%" stopColor="white" />
                    </linearGradient>
                  </defs>
                )}

                {/* Gradient cho sao 1/2 */}
                {isHalfStar && (
                  <defs>
                    <linearGradient id="halfGradient">
                      <stop offset="50%" stopColor="#fbbf24" />
                      <stop offset="50%" stopColor="white" />
                    </linearGradient>
                  </defs>
                )}

                {/* Gradient cho sao 1/4 */}
                {isQuarterStar && (
                  <defs>
                    <linearGradient id="quarterGradient">
                      <stop offset="25%" stopColor="#fbbf24" />
                      <stop offset="25%" stopColor="white" />
                    </linearGradient>
                  </defs>
                )}

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                />
              </svg>
            );
          })}
        </div>

        {/* Hiển thị điểm trung bình và số lượng đánh giá */}
        <span className="text-yellow-500 text-xl font-bold">
          {averageRating.toFixed(2)}
        </span>
        <span className="text-gray-500">({book.reviews.length} reviews)</span>
      </div>
      <ul className="mt-8 space-y-4">
        {reviews.map((review, index) => (
          <li key={index} className="border-b pb-4">
            <div className="flex flex-row items-start space-x-4 mb-4">
              {/* Avatar và tên thành viên */}
              <div className="flex-shrink-0">
                <img
                  src={review.memberImage}
                  alt={review.memberName}
                  className="w-12 h-12 rounded-full shadow-md"
                />
              </div>
              <div className="flex-1">
                {/* Tên thành viên */}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-800">
                    {review.memberName}
                  </span>
                  <p className="text-sm text-gray-500">
                    {new Intl.DateTimeFormat("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }).format(new Date(review.createdAt))}
                  </p>
                </div>
                {/* Nội dung đánh giá */}
                <div className="mt-2">
                  <p className="text-gray-700">{review.text}</p>
                </div>
                {/* Điểm đánh giá */}
                <div className="mt-2 flex items-center space-x-1">
                  {Array.from({ length: 5 }, (_, index) => (
                    <svg
                      key={index}
                      xmlns="http://www.w3.org/2000/svg"
                      fill={index < review.rating ? "#fbbf24" : "none"}
                      stroke={index < review.rating ? "#fbbf24" : "gray"}
                      strokeWidth="2"
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                      />
                    </svg>
                  ))}
                  <span className="text-sm text-gray-500 ml-2">
                    {review.rating} / 5
                  </span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WriteReview(bookId, fetchBookData) {
  const [selectedRating, setSelectedRating] = useState(0); // Trạng thái cho sao được chọn
  const [hoveredRating, setHoveredRating] = useState(0); // Trạng thái cho sao được hover
  const [reviewText, setReviewText] = useState(""); // Trạng thái cho nội dung đánh giá
  const [showReviewInput, setShowReviewInput] = useState(false); // Trạng thái cho việc hiển thị ô nhập đánh giá
  const [userId, setUserId] = useState(null); // Trạng thái cho userId

  const saveReview = async () => {
    try {
      const bookID = bookId.bookId;
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Gửi token trong header
        },
        body: JSON.stringify({ bookID, selectedRating, reviewText, userId }),
      });
      const data = await response.json();
      if (data.success) {
        alert("Review submitted successfully!");
        window.location.reload(); // Tải lại trang
      } else {
        alert("Failed to submit review.");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("An error occurred while submitting the review.");
    }
  };
  if (!showReviewInput) {
    return (
      <div>
        {/* Ratings & Reviews Section */}
        <h2 className="text-2xl font-semibold text-gray-900">
          Ratings & Reviews
        </h2>
        <div className="mt-6 flex flex-col items-center">
          {/* Icon và tiêu đề */}

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6 text-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 14.25l4.5 2.625-1.125-4.875L18 9.375l-4.875-.375L12 4.5l-1.125 4.5L6 9.375l2.625 2.625L7.5 16.875 12 14.25z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mt-4 text-gray-900">
              What do <i>you</i> think?
            </h3>
          </div>

          {/* Stars for rating */}
          <div className="flex flex-row space-x-6 mt-2 items-center">
            <div className="flex flex-col items-center">
              <div className="mt-4 flex justify-center space-x-1">
                {Array.from({ length: 5 }, (_, index) => (
                  <svg
                    key={index}
                    xmlns="http://www.w3.org/2000/svg"
                    fill={index < hoveredRating ? "#fbbf24" : "none"}
                    stroke={index < hoveredRating ? "#fbbf24" : "gray"}
                    strokeWidth="2"
                    className="w-8 h-8 cursor-pointer transition"
                    viewBox="0 0 24 24"
                    onMouseEnter={() => setHoveredRating(index + 1)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => {
                      const token = localStorage.getItem("authToken");
                      if (!token) {
                        alert(
                          "You need to log in to rate and review this book."
                        );
                        window.location.href = "/login"; // Chuyển hướng đến trang đăng nhập
                        return;
                      }

                      try {
                        const decodedToken = jwtDecode(token); // Giải mã token

                        setUserId(decodedToken.userId); // Lưu userId vào state (nếu cần dùng sau này)
                      } catch (error) {
                        console.error("Invalid token:", error);
                        alert("Your session has expired. Please log in again.");
                        window.location.href = "/login"; // Chuyển hướng đến trang đăng nhập
                        return;
                      }

                      setSelectedRating(index + 1); // Lưu số sao được chọn
                      setShowReviewInput(true); // Hiển thị ô nhập review
                    }} // Lưu số sao được chọn
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                    />
                  </svg>
                ))}
              </div>
              <p className="text-gray-500 mt-2">
                Rate this book and write a review
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div>
        {/* Ratings & Reviews Section */}
        <h2 className="text-2xl font-semibold text-gray-900">
          Ratings & Reviews
        </h2>
        <div className="flex flex-row mt-4">
          <p className="font-semibold text-gray-700">Your rating: &nbsp; </p>
          {Array.from({ length: 5 }, (_, index) => (
            <svg
              key={index}
              xmlns="http://www.w3.org/2000/svg"
              fill={index < selectedRating ? "#fbbf24" : "none"}
              stroke={index < selectedRating ? "#fbbf24" : "gray"}
              strokeWidth="2"
              className="w-5 h-5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
              />
            </svg>
          ))}
        </div>

        <div className="mt-4 w-full text-gray-700">
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)} // Cập nhật nội dung review
            placeholder="Write your review here..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            rows="4"
          ></textarea>
          <div className="flex flex-row space-x-4 mt-2">
            <button
              onClick={() => {
                if (!reviewText.trim()) {
                  alert("Please write a review before submitting!");
                  return;
                }

                setShowReviewInput(false); // Ẩn ô nhập review sau khi gửi
                setSelectedRating(0); // Reset sao đã chọn
                setReviewText(""); // Reset nội dung review
                saveReview(); // Gọi hàm lưu review
              }}
              className="mt-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition cursor-pointer"
            >
              Submit Review
            </button>
            <button
              onClick={() => setShowReviewInput(false)}
              className="mt-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
}

function AuthorDetail({ authorName, authorBio, authorImage }) {
  return (
    <div className="flex flex-col  space-x-4 ">
      <h2 className="text-2xl font-semibold text-gray-900">Author Details</h2>
      <div className="flex items-center space-x-8 mt-4">
        <img
          src={authorImage || "/images/default-avatar.jpg"}
          alt={authorName}
          className="w-16 h-16 rounded-full"
        />

        <h3 className="text-lg font-semibold text-gray-700">{authorName}</h3>
      </div>
      <p className="text-gray-700 mt-4">{authorBio}</p>
    </div>
  );
}

export default function BookDetail({ params }) {
  const { id } = use(params);
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Thêm trạng thái loading
  const [hoveredRating, setHoveredRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  const fetchBookData = async (id) => {
    try {
      setIsLoading(true); // Bắt đầu tải dữ liệu
      const response = await fetch(`http://localhost:3000/api/books/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch book data");
      }
      const body = await response.json();
      const book = body.data; // Giả sử bạn đã sửa API để trả về dữ liệu đúng định dạng
      if (book.reviews) {
        const average =
          book.reviews.reduce((sum, review) => sum + review.rating, 0) /
          book.reviews.length;

        setAverageRating(average.toFixed(2)); // Cập nhật điểm trung bình
      }
      if (!body.success) {
        throw new Error(book.message || "Book not found");
      }

      setBook(book);
    } catch (error) {
      console.error("Error fetching book data:", error);
      setBook(null);
    } finally {
      setIsLoading(false); // Kết thúc tải dữ liệu
    }
  };

  useEffect(() => {
    fetchBookData(id);
  }, [id]); // Gọi hàm fetchBookData khi component được mount hoặc id thay đổi

  if (isLoading) {
    return (
      <div className="bg-gradient-to-b from-amber-50 to-white min-h-screen">
        <section className="p-5">
          <h2 className="text-2xl font-bold text-center">Loading...</h2>
        </section>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="bg-gradient-to-b from-amber-50 to-white min-h-screen">
        <Navbar />
        <section className="p-5">
          <h2 className="text-2xl font-bold text-center">Book Not Found</h2>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-amber-50 to-white min-h-screen">
      <Navbar />
      <section className="p-6">
        <div className="flex flex-col lg:flex-row items-center lg:items-start lg:space-x-12 w-full max-w-7xl mx-auto">
          {/* Book Cover */}
          <div className="w-64 flex-col items-center justify-center sticky top-27 ">
            <img
              src={book.coverImage || "/images/default-book-cover.jpg"}
              alt={book.title}
              className="w-64 h-96 object-cover rounded-lg shadow-md"
            />
            <button className="ml-auto mr-auto mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition items-center justify-center flex">
              Borrow Now
            </button>
            <div className="mt-4 text-center">
              <div className="flex justify-center space-x-1">
                {Array.from({ length: 5 }, (_, index) => (
                  <svg
                    key={index}
                    xmlns="http://www.w3.org/2000/svg"
                    fill={index < hoveredRating ? "#fbbf24" : "none"} // Tô màu vàng cho các sao được hover
                    stroke={index < hoveredRating ? "#fbbf24" : "gray"} // Đổi màu viền
                    strokeWidth="2"
                    className="w-8 h-8 cursor-pointer transition"
                    viewBox="0 0 24 24"
                    onMouseEnter={() => setHoveredRating(index + 1)} // Cập nhật số sao khi hover
                    onMouseLeave={() => setHoveredRating(0)} // Reset khi không hover
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                    />
                  </svg>
                ))}
              </div>
              <p className="text-gray-500 mt-2">Rate this book</p>
            </div>
          </div>

          {/* Book Details */}
          <div className="flex-1 ">
            <h1 className="text-4xl font-bold text-gray-900">{book.title}</h1>
            <p className="text-lg text-gray-600 mt-2">
              By <span className="font-medium">{book.authorName}</span>
            </p>
            <div className="flex items-center mt-4 space-x-2">
              {/* Hiển thị các ngôi sao */}
              <div className="flex items-center">
                {Array.from({ length: 5 }, (_, index) => {
                  const starValue = index + 1;
                  const isFullStar = starValue <= averageRating;
                  const isThreeQuarterStar =
                    starValue - 0.25 <= averageRating &&
                    starValue > averageRating;
                  const isHalfStar =
                    starValue - 0.5 <= averageRating &&
                    starValue > averageRating;
                  const isQuarterStar =
                    starValue - 0.75 <= averageRating &&
                    starValue > averageRating;

                  return (
                    <svg
                      key={index}
                      xmlns="http://www.w3.org/2000/svg"
                      fill={
                        isFullStar
                          ? "#fbbf24"
                          : isThreeQuarterStar
                          ? "url(#threeQuarterGradient)"
                          : isHalfStar
                          ? "url(#halfGradient)"
                          : isQuarterStar
                          ? "url(#quarterGradient)"
                          : "none"
                      }
                      stroke="#fbbf24"
                      strokeWidth="2"
                      className="w-8 h-8"
                      viewBox="0 0 24 24"
                    >
                      {/* Gradient cho sao 3/4 */}
                      {isThreeQuarterStar && (
                        <defs>
                          <linearGradient id="threeQuarterGradient">
                            <stop offset="75%" stopColor="#fbbf24" />
                            <stop offset="75%" stopColor="white" />
                          </linearGradient>
                        </defs>
                      )}

                      {/* Gradient cho sao 1/2 */}
                      {isHalfStar && (
                        <defs>
                          <linearGradient id="halfGradient">
                            <stop offset="50%" stopColor="#fbbf24" />
                            <stop offset="50%" stopColor="white" />
                          </linearGradient>
                        </defs>
                      )}

                      {/* Gradient cho sao 1/4 */}
                      {isQuarterStar && (
                        <defs>
                          <linearGradient id="quarterGradient">
                            <stop offset="25%" stopColor="#fbbf24" />
                            <stop offset="25%" stopColor="white" />
                          </linearGradient>
                        </defs>
                      )}

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                      />
                    </svg>
                  );
                })}
              </div>

              {/* Hiển thị điểm trung bình và số lượng đánh giá */}
              <span className="text-yellow-500 text-xl font-bold">
                {averageRating}
              </span>
              <span className="text-gray-500">
                ({book.reviews?.length || 0} reviews)
              </span>
            </div>
            <p className="mt-6 text-gray-700 whitespace-pre-line">
              {book.description}
            </p>
            {/* Genres */}
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="text-gray-900 font-semibold">Genres:</span>
              {book.genres.split(",").map((genre, index) => (
                <span
                  key={index}
                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm  hover:bg-orange-500 hover:text-white transition duration-200 cursor-pointer"
                >
                  {genre.trim()}
                </span>
              ))}
            </div>
            <hr className="my-6" />
            {/* Author */}
            <div>
              <AuthorDetail
                authorName={book.authorName}
                authorBio={book.authorBio}
                authorImage={book.authorImage}
              />
            </div>
            <hr className="my-6" />
            {/* Reviews and Ratings */}
            <WriteReview bookId={book._id} fetchBookData={fetchBookData} />
            <hr className="my-6" />
            {/* Community Reviews */}
            <div>
              <Review reviews={book.reviews || []} book={book} />
            </div>
          </div>
        </div>
        {/* Reviews Section */}
      </section>
    </div>
  );
}
