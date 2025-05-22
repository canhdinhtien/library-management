"use client";

import Image from "next/image";
import Link from "next/link";
import { Book } from "lucide-react";

const BookCard = ({ title, author, image, id }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-xs transition-all duration-300 hover:shadow-xl flex flex-col h-full">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100 text-gray-900 items-center flex justify-center">
        {image ? (
          <Image
            src={image || "/placeholder.svg"}
            alt={`${title}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 hover:scale-103"
            priority={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <Book className="h-16 w-16 text-gray-900" />
          </div>
        )}
      </div>

      <div className="flex flex-col items-center flex-grow p-4">
        <h3
          className="font-semibold text-lg text-gray-800 line-clamp-2 mb-1 text-center"
          title={title}
        >
          {title}
        </h3>
        <p className="text-gray-600 text-sm mb-4" title={`By ${author}`}>
          {author}
        </p>

        <div className="mt-auto">
          <Link
            href={`/book/${id}`}
            className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors duration-200 font-medium text-sm"
            aria-label={`Read ${title} ${author}`}
          >
            Borrow Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
