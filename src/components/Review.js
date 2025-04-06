import Image from "next/image";
const Review = ({ reviews }) => {
  //Average rating
  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  return (
    <div className="mt-4 p-4 border rounded-lg">
      <p className="font-semibold">
        {username} ⭐ {rating}/5
      </p>
      <p>{comment}</p>
    </div>
  );
};

export default Review;