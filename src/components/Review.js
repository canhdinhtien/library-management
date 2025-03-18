const Review = ({ username, rating, comment }) => {
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
