import Image from "next/image";
const Review = ({ reviews }) => {
  //Average rating
  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  return (
    <div className="flex flex-col md:flex-row mt-4 p-4 border rounded-lg shadow-md ">
      <div className="w-full items-center md:w-1/2 flex flex-col">
        <h3 className="font-semibold text-center">Average Rating</h3>
        <p className="text-center">{averageRating.toFixed(1)} out of 5 stars</p>
      </div>
      <div className="w-full md:w-1/2">
        {reviews.map((review) => (
          <div key={review.id} className="mt-4">
            <hr className="my-4 border-gray-300" />
            <div className="flex justify-between">
              <div className="">
                <div className="flex items-center space-x-2">
                  <Image
                    src={review.avt}
                    alt={review.username}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <p className="font-semibold">{review.username} </p>
                </div>
                <p className="text-gray-400 mt-1">{review.time}</p>
              </div>
              <span>
                {Array.from({ length: review.rating }, (_, i) => (
                  <span key={i}>⭐</span>
                ))}
              </span>
            </div>
            <p>{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Review;
