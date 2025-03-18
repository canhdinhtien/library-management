import Navbar from "../../components/Navbar";
import Review from "../../components/Review";

export default function BookDetail({ params }) {
  return (
    <div>
      <Navbar />
      <section className="p-6">
        <h2 className="text-2xl font-bold">{params.id.replaceAll("-", " ")}</h2>
        <p className="text-gray-600">By Alex Michaelides</p>
        <p className="mt-4">
          In a world where fairytales collide with a dystopian reality...
        </p>
        <Review username="Alice R." rating={4} comment="Highly recommend!" />
      </section>
    </div>
  );
}
