"use client";
import Image from "next/image";
import Link from "next/link";

const BookCard = ({ title, author, image, id }) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden w-56">
      <div className="h-72 relative">
        <Image src={image} alt={title} layout="fill" objectFit="cover" />
      </div>

      <div className="p-4 text-center">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-gray-500">{author}</p>

        <Link
          href={`/book/${id}`}
          className="mt-3 inline-block px-4 py-2 border rounded-lg hover:bg-gray-200 hover:scale-110 transition-transform duration-200"
        >
          <span>More Info</span>
        </Link>
      </div>
    </div>
  );
};

export default BookCard;
