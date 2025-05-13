import React, { useState } from "react";

const AddPublisherModal = ({ isOpen, onClose, onPublisherAdded }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [publisherLogo, setPublisherLogo] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/publishers", {
        method: "POST",
        headers: {
          Authorizer: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          logo: publisherLogo,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newPublisher = await response.json();
      console.log("New publisher created:", newPublisher);
      onClose();
      if (onPublisherAdded) {
        onPublisherAdded();
      }
    } catch (error) {
      console.error("Failed to create publisher:", error);
      // Handle error appropriately (e.g., display an error message)
    }
  };

  const uploadPublisherLogo = async (file) => {
    if (!file) {
      setPublisherLogo("");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/upload-publisher-logo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPublisherLogo(data.imageUrl);
    } catch (error) {
      console.error("Failed to upload publisher logo:", error);
      // Handle error appropriately (e.g., display an error message)
      setPublisherLogo("");
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Add New Publisher</h2>
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
                  htmlFor="description"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="logo"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Logo
                </label>
                <div
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 relative"
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    uploadPublisherLogo(file);
                  }}
                >
                  <input
                    type="file"
                    id="logo"
                    className="absolute inset-0 opacity-0 w-full h-full"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      uploadPublisherLogo(file);
                    }}
                  />
                  <div className="text-center py-4">
                    Drag and drop image here or click to select
                  </div>
                </div>
                {publisherLogo && (
                  <img
                    src={publisherLogo}
                    alt="Logo Preview"
                    className="mt-2 h-20 w-auto"
                  />
                )}
              </div>
              <div className="flex items-center justify-between">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="submit"
                >
                  Add Publisher
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

export default AddPublisherModal;
