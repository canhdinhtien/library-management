import React, { useState } from "react";

const AddAuthorModal = ({ isOpen, onClose, onAuthorAdded }) => {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [authorCoverImage, setAuthorCoverImage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/authors", {
        method: "POST",
        headers: {
          Authorizer: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          bio,
          authorCoverImage,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newAuthor = await response.json();
      console.log("New author created:", newAuthor);
      onClose();
      onAuthorAdded();
    } catch (error) {
      console.error("Failed to create author:", error);
      // Handle error appropriately (e.g., display an error message)
    }
  };

  const uploadAuthorCoverImage = async (file) => {
    if (!file) {
      setAuthorCoverImage("");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/upload-author-cover", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAuthorCoverImage(data.imageUrl);
    } catch (error) {
      console.error("Failed to upload author cover image:", error);
      // Handle error appropriately (e.g., display an error message)
      setAuthorCoverImage("");
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Add New Author</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="bio"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="authorCoverImage"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Author Cover Image
                </label>
                <div
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 relative"
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    uploadAuthorCoverImage(file);
                  }}
                >
                  <input
                    type="file"
                    id="authorCoverImage"
                    className="absolute inset-0 opacity-0 w-full h-full"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      uploadAuthorCoverImage(file);
                    }}
                  />
                  <div className="text-center py-4">
                    Drag and drop image here or click to select
                  </div>
                </div>
                {authorCoverImage && (
                  <img
                    src={authorCoverImage}
                    alt="Cover Preview"
                    className="mt-2 h-20 w-auto"
                  />
                )}
              </div>
              <div className="flex items-center justify-between">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="submit"
                >
                  Add Author
                </button>
                <button
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="button"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddAuthorModal;
