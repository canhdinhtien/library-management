"use client";

const Genre = ({ genres }) => {
  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Book Genres</h2>

      {/* Hiển thị danh sách thể loại dưới dạng grid */}
      <div className="grid grid-cols-4 gap-6 justify-center">
        {genres.map((genre) => (
          <div
            key={genre.id}
            className="p-4 bg-gray-100 rounded-lg shadow-md text-center cursor-pointer hover:bg-gray-200 transition"
          >
            <h3 className="text-lg font-semibold">{genre.name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Genre;
