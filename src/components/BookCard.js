"use client";
import Image from "next/image";
import Link from "next/link";

const BookCard = ({ title, author, image, id }) => {
  return (
    <div
      className="bg-white shadow-md rounded-lg overflow-hidden 
                w-[min(100%,400px)] sm:w-[min(100%,450px)] md:w-[min(100%,500px)] 
                aspect-[3/4] flex flex-col"
    >
      <div className="h-44 sm:h-52 md:h-60 lg:h-72 relative">
        <Image src={image} alt={title} layout="fill" objectFit="cover" />
      </div>

      <div className="flex flex-col justify-end flex-grow p-5 text-center">
        <h3 className="font-semibold text-base sm:text-lg md:text-xl">
          {title}
        </h3>
        <p className="text-gray-500 text-sm sm:text-base md:text-lg">
          {author}
        </p>

        <Link
          href={`/book/${id}`}
          className="mt-4 inline-block px-5 py-3 border rounded-lg 
                 hover:bg-gray-600 hover:scale-105 transition-transform 
                 duration-200 text-yellow-900"
        >
          <span className="text-yellow-950">Read Now</span>
        </Link>
      </div>
    </div>
  );
};

export default BookCard;