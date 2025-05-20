"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";

const AddBookModal = ({ isOpen, onClose, onBookAdded }) => {
  const [coverImage, setCoverImage] = useState("");
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImageURLInput, setCoverImageURLInput] = useState("");
  const [bookCode, setBookCode] = useState("");
  const [title, setTitle] = useState("");
  const [genres, setGenres] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [availableQuantity, setAvailableQuantity] = useState("");

  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);

  const [showAuthorInlineForm, setShowAuthorInlineForm] = useState(false);
  const [newAuthorCode, setNewAuthorCode] = useState("");
  const [newAuthorName, setNewAuthorName] = useState("");
  const [newAuthorGender, setNewAuthorGender] = useState("");
  const [newAuthorImage, setNewAuthorImage] = useState("");
  const [newAuthorImageFile, setNewAuthorImageFile] = useState(null);
  const [newAuthorBio, setNewAuthorBio] = useState("");
  const [newAuthorBirthYear, setNewAuthorBirthYear] = useState("");
  const [newAuthorDeathYear, setNewAuthorDeathYear] = useState("");
  const [newAuthorCoopPublisherId, setNewAuthorCoopPublisherId] = useState("");

  const [showPublisherInlineForm, setShowPublisherInlineForm] = useState(false);
  const [newPublisherCode, setNewPublisherCode] = useState("");
  const [newPublisherName, setNewPublisherName] = useState("");
  const [newPublisherAddress, setNewPublisherAddress] = useState("");
  const [newPublisherPhone, setNewPublisherPhone] = useState("");
  const [newPublisherLogoUrl, setNewPublisherLogoUrl] = useState("");
  const [newPublisherLogoImageFile, setNewPublisherLogoImageFile] =
    useState(null);

  const [isSubmittingBook, setIsSubmittingBook] = useState(false);
  const [isUploadingBookCover, setIsUploadingBookCover] = useState(false);
  const [isUploadingAuthorImage, setIsUploadingAuthorImage] = useState(false);
  const [isUploadingPublisherLogo, setIsUploadingPublisherLogo] =
    useState(false);

  const [activeTab, setActiveTab] = useState("book-info");

  const resetForm = () => {
    setCoverImage("");
    setCoverImageFile(null);
    setCoverImageURLInput("");
    setBookCode("");
    setTitle("");
    setGenres("");
    setDescription("");
    setPrice("");
    setQuantity("");
    setAvailableQuantity("");
    setAuthor("");
    setPublisher("");

    setShowAuthorInlineForm(false);
    setNewAuthorCode("");
    setNewAuthorName("");
    setNewAuthorGender("");
    setNewAuthorImage("");
    setNewAuthorImageFile(null);
    setNewAuthorBio("");
    setNewAuthorBirthYear("");
    setNewAuthorDeathYear("");
    setNewAuthorCoopPublisherId("");

    setShowPublisherInlineForm(false);
    setNewPublisherCode("");
    setNewPublisherName("");
    setNewPublisherAddress("");
    setNewPublisherPhone("");
    setNewPublisherLogoUrl("");
    setNewPublisherLogoImageFile(null);
  };

  const fetchAuthors = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/authors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok)
        throw new Error(`Failed to fetch authors: ${response.status}`);
      const responseData = await response.json();
      if (responseData.success) {
        setAuthors(responseData.data);
      } else {
        console.error(
          "API Error fetching authors:",
          responseData.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const fetchPublishers = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/publishers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok)
        throw new Error(`Failed to fetch publishers: ${response.status}`);
      const responseData = await response.json();
      if (responseData.success) {
        setPublishers(responseData.data);
      } else {
        console.error(
          "API Error fetching publishers:",
          responseData.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
      fetchAuthors();
      fetchPublishers();
    }
  }, [isOpen]);

  const uploadImage = async (
    file,
    uploadEndpoint,
    setLoadingState,
    setImageUrlState
  ) => {
    if (!file) return null;
    setLoadingState(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Auth token not found");
      const response = await fetch(uploadEndpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }
      const data = await response.json();
      if (setImageUrlState) setImageUrlState(data.imageUrl);
      return data.imageUrl;
    } catch (error) {
      console.error(`Failed to upload image to ${uploadEndpoint}:`, error);
      toast.error(`Image upload failed: ${error.message}`);
      return null;
    } finally {
      setLoadingState(false);
    }
  };

  const handleBookCoverFileChange = (file) => {
    if (file) {
      setCoverImageFile(file);
      setCoverImageURLInput("");
      setCoverImage("");
    }
  };

  const handleAuthorImageFileChange = (file) => {
    if (file) {
      setNewAuthorImageFile(file);
      setNewAuthorImage("");
    }
  };

  const handlePublisherLogoFileChange = (file) => {
    if (file) {
      setNewPublisherLogoImageFile(file);
      setNewPublisherLogoUrl("");
    }
  };

  const handleSaveNewAuthor = async () => {
    if (
      !newAuthorCode.trim() ||
      !newAuthorName.trim() ||
      !newAuthorBirthYear.trim()
      // !newAuthorCoopPublisherId.trim()
    ) {
      toast.info(
        "Vui lòng nhập đủ các trường bắt buộc cho tác giả: Mã tác giả, Tên, Năm sinh, NXB hợp tác."
      );
      return;
    }

    let finalAuthorImageUrl = newAuthorImage;
    if (newAuthorImageFile) {
      finalAuthorImageUrl = await uploadImage(
        newAuthorImageFile,
        "/api/upload-author-cover",
        setIsUploadingAuthorImage,
        setNewAuthorImage
      );
      if (!finalAuthorImageUrl) return;
    }

    const authorData = {
      authorCode: newAuthorCode.trim(),
      name: newAuthorName.trim(),
      birthYear: parseInt(newAuthorBirthYear, 10),
      coopPublisher: newAuthorCoopPublisherId,
    };

    if (newAuthorGender) authorData.gender = newAuthorGender;
    if (finalAuthorImageUrl) authorData.image = finalAuthorImageUrl;
    if (newAuthorBio.trim()) authorData.bio = newAuthorBio.trim();
    if (newAuthorDeathYear.trim())
      authorData.deathYear = parseInt(newAuthorDeathYear, 10);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Auth token not found");
      const response = await fetch("/api/authors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(authorData),
      });
      const responseData = await response.json();
      if (!response.ok) {
        if (response.status === 400 && responseData.errors) {
          let errorMessages = "Lỗi xác thực:\n";
          for (const field in responseData.errors) {
            errorMessages += `- ${responseData.errors[field]}\n`;
          }
          toast.error(errorMessages.trim());
        } else {
          toast.warning(
            responseData.message ||
              `Không thể lưu tác giả. Status: ${response.status}`
          );
        }
        return;
      }
      toast.success(responseData.message || "Tác giả đã được thêm thành công!");
      setNewAuthorCode("");
      setNewAuthorName("");
      setNewAuthorGender("");
      setNewAuthorImage("");
      setNewAuthorImageFile(null);
      setNewAuthorBio("");
      setNewAuthorBirthYear("");
      setNewAuthorDeathYear("");
      setNewAuthorCoopPublisherId("");
      setShowAuthorInlineForm(false);
      await fetchAuthors();
      if (responseData.data && responseData.data._id)
        setAuthor(responseData.data._id);
    } catch (error) {
      console.error("Lỗi khi lưu tác giả:", error);
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleSaveNewPublisher = async () => {
    if (!newPublisherCode.trim() || !newPublisherName.trim()) {
      toast.info(
        "Vui lòng nhập đủ các trường bắt buộc cho NXB: Mã NXB và Tên NXB."
      );
      return;
    }
    let finalPublisherLogoUrl = newPublisherLogoUrl;
    if (newPublisherLogoImageFile) {
      finalPublisherLogoUrl = await uploadImage(
        newPublisherLogoImageFile,
        "/api/upload-publisher-logo",
        setIsUploadingPublisherLogo,
        setNewPublisherLogoUrl
      );
      if (!finalPublisherLogoUrl) return;
    }

    const publisherData = {
      publisherCode: newPublisherCode.trim(),
      name: newPublisherName.trim(),
    };

    if (newPublisherAddress.trim())
      publisherData.address = newPublisherAddress.trim();
    if (newPublisherPhone.trim())
      publisherData.phone = newPublisherPhone.trim();
    if (finalPublisherLogoUrl) publisherData.logoUrl = finalPublisherLogoUrl;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Auth token not found");
      const response = await fetch("/api/publishers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(publisherData),
      });
      const responseData = await response.json();
      if (!response.ok) {
        if (response.status === 400 && responseData.errors) {
          let errorMessages = "Lỗi xác thực:\n";
          for (const field in responseData.errors) {
            errorMessages += `- ${responseData.errors[field]}\n`;
          }
          toast.error(errorMessages.trim());
        } else {
          toast.error(
            responseData.message ||
              `Không thể lưu NXB. Status: ${response.status}`
          );
        }
        return;
      }
      toast.success(
        responseData.message || "Nhà xuất bản đã được thêm thành công!"
      );
      setNewPublisherCode("");
      setNewPublisherName("");
      setNewPublisherAddress("");
      setNewPublisherPhone("");
      setNewPublisherLogoUrl("");
      setNewPublisherLogoImageFile(null);
      setShowPublisherInlineForm(false);
      await fetchPublishers();
      if (responseData.data && responseData.data._id)
        setPublisher(responseData.data._id);
    } catch (error) {
      console.error("Lỗi khi lưu NXB:", error);
      toast.error(`Đã xảy ra lỗi: ${error.message}`);
    }
  };

  const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  const handleSubmitBook = async (e) => {
    e.preventDefault();
    setIsSubmittingBook(true);

    let finalBookCoverImageUrl = coverImage;
    if (coverImageFile) {
      finalBookCoverImageUrl = await uploadImage(
        coverImageFile,
        "/api/upload-book-cover",
        setIsUploadingBookCover,
        setCoverImage
      );
      if (!finalBookCoverImageUrl) {
        setIsSubmittingBook(false);
        return;
      }
    } else if (coverImageURLInput.trim()) {
      finalBookCoverImageUrl = coverImageURLInput.trim();
    } else if (!finalBookCoverImageUrl) {
      toast.info("Vui lòng cung cấp ảnh bìa sách.");
      setIsSubmittingBook(false);
      return;
    }

    if (!isValidObjectId(author) || !isValidObjectId(publisher)) {
      toast.error("Invalid Author or Publisher ID");
      setIsSubmittingBook(false);
      return;
    }

    const bookData = {
      coverImage: finalBookCoverImageUrl,
      bookCode,
      title,
      genres: genres
        .split(",")
        .map((g) => g.trim())
        .filter((g) => g),
      description,
      price: parseFloat(price),
      quantity: parseInt(quantity, 10),
      availableQuantity: parseInt(availableQuantity, 10),
      author, // Lưu ObjectId của Author
      publisher, // Lưu ObjectId của Publisher
      borrowedCount: 0,
    };

    console.log("bookData before submit:", bookData);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookData),
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(
          responseData.message ||
            `Không thể thêm sách. Status: ${response.status}`
        );
      }
      toast.success("Book added successfully!");
      if (typeof onBookAdded === "function") onBookAdded(responseData.data);
      onClose();
    } catch (error) {
      console.error("Lỗi khi thêm sách:", error);
      toast.error(`Lỗi: ${error.message}`);
    } finally {
      setIsSubmittingBook(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-2 min-w-0 overflow-y-auto max-h-screen">
        <h2 className="text-xl font-bold mb-4">Add New Book</h2>

        <div className="mb-4 border-b">
          <div className="flex">
            <button
              type="button"
              onClick={() => setActiveTab("book-info")}
              className={`py-2 px-4 ${
                activeTab === "book-info"
                  ? "border-b-2 border-orange-500 text-orange-500"
                  : "text-gray-500"
              }`}
            >
              Book Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("author")}
              className={`py-2 px-4 ${
                activeTab === "author"
                  ? "border-b-2 border-orange-500 text-orange-500"
                  : "text-gray-500"
              }`}
            >
              Author
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("publisher")}
              className={`py-2 px-4 ${
                activeTab === "publisher"
                  ? "border-b-2 border-orange-500 text-orange-500"
                  : "text-gray-500"
              }`}
            >
              Publisher
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmitBook}>
          <div className={activeTab === "book-info" ? "block" : "hidden"}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Book Code
              </label>
              <input
                type="text"
                value={bookCode}
                onChange={(e) => setBookCode(e.target.value)}
                required
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Genres{" "}
                <span className="text-xs text-gray-500">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={genres}
                onChange={(e) => setGenres(e.target.value)}
                required
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className="w-full p-2 border rounded-md"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    if (!availableQuantity)
                      setAvailableQuantity(e.target.value);
                  }}
                  required
                  min="0"
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Cover Image
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleBookCoverFileChange(e.target.files[0])}
                  className="w-full p-1 border rounded-md text-sm"
                />
              </div>
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Or paste image URL"
                  value={coverImageURLInput}
                  onChange={(e) => {
                    setCoverImageURLInput(e.target.value);
                    setCoverImageFile(null);
                    setCoverImage(e.target.value);
                  }}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              {(coverImageFile || coverImage) && (
                <div className="mt-2">
                  <Image
                    src={
                      coverImageFile
                        ? URL.createObjectURL(coverImageFile)
                        : coverImage
                    }
                    alt="Book Cover Preview"
                    className="h-32 w-auto object-contain border rounded"
                    width={128}
                    height={192}
                  />
                </div>
              )}
            </div>
          </div>

          <div className={activeTab === "author" ? "block" : "hidden"}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Author</label>
              <select
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select Author</option>
                {authors.map((auth) => (
                  <option key={auth._id} value={auth._id}>
                    {auth.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowAuthorInlineForm(!showAuthorInlineForm)}
                className="mt-1 text-sm text-blue-600 hover:underline"
              >
                {showAuthorInlineForm ? "Cancel" : "+ Add New Author"}
              </button>
            </div>

            {showAuthorInlineForm && (
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Author Code
                  </label>
                  <input
                    type="text"
                    value={newAuthorCode}
                    onChange={(e) => setNewAuthorCode(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={newAuthorName}
                    onChange={(e) => setNewAuthorName(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Birth Year
                  </label>
                  <input
                    type="number"
                    value={newAuthorBirthYear}
                    onChange={(e) => setNewAuthorBirthYear(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Death Year
                  </label>
                  <input
                    type="number"
                    value={newAuthorDeathYear}
                    onChange={(e) => setNewAuthorDeathYear(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Gender
                  </label>
                  <select
                    value={newAuthorGender}
                    onChange={(e) => setNewAuthorGender(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* <div>
                  <label className="block text-sm font-medium mb-1">
                    Cooperating Publisher
                  </label>
                  <select
                    value={newAuthorCoopPublisherId}
                    onChange={(e) =>
                      setNewAuthorCoopPublisherId(e.target.value)
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Publisher</option>
                    {publishers.map((pub) => (
                      <option key={pub._id} value={pub._id}>
                        {pub.name}
                      </option>
                    ))}
                  </select>
                </div> */}

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Biography
                  </label>
                  <textarea
                    value={newAuthorBio}
                    onChange={(e) => setNewAuthorBio(e.target.value)}
                    rows="3"
                    className="w-full p-2 border rounded-md"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Author Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleAuthorImageFileChange(e.target.files[0])
                    }
                    className="w-full p-1 border rounded-md text-sm"
                  />
                  {newAuthorImageFile && (
                    <p className="text-xs text-gray-500 mt-1">
                      Selected: {newAuthorImageFile.name}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSaveNewAuthor}
                  className="w-full p-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                >
                  Save Author
                </button>
              </div>
            )}
          </div>

          <div className={activeTab === "publisher" ? "block" : "hidden"}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Publisher
              </label>
              <select
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                required
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select Publisher</option>
                {publishers.map((pub) => (
                  <option key={pub._id} value={pub._id}>
                    {pub.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() =>
                  setShowPublisherInlineForm(!showPublisherInlineForm)
                }
                className="mt-1 text-sm text-blue-600 hover:underline"
              >
                {showPublisherInlineForm ? "Cancel" : "+ Add New Publisher"}
              </button>
            </div>

            {/* {showPublisherInlineForm && (
              <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-2 min-w-0 overflow-y-auto max-h-screen">
                  <label className="block text-sm font-medium mb-1">
                    Publisher Code
                  </label>
                  <input
                    type="text"
                    value={newPublisherCode}
                    onChange={(e) => setNewPublisherCode(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={newPublisherName}
                    onChange={(e) => setNewPublisherName(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={newPublisherAddress}
                    onChange={(e) => setNewPublisherAddress(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={newPublisherPhone}
                    onChange={(e) => setNewPublisherPhone(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveNewPublisher}
                  className="w-full p-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                >
                  Save Publisher
                </button>
              </div>
            )} */}
            {showPublisherInlineForm && (
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Publisher Code
                  </label>
                  <input
                    type="text"
                    value={newPublisherCode}
                    onChange={(e) => setNewPublisherCode(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={newPublisherName}
                    onChange={(e) => setNewPublisherName(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={newPublisherAddress}
                    onChange={(e) => setNewPublisherAddress(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={newPublisherPhone}
                    onChange={(e) => setNewPublisherPhone(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSaveNewPublisher}
                  className="w-full p-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                >
                  Save Publisher
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingBook}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBookModal;
