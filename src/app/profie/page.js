import Navbar from "../components/Navbar";
import BorrowStatus from "../components/BorrowStatus";

export default function Profile() {
  return (
    <div>
      <Navbar />
      <section className="p-6">
        <h2 className="text-2xl font-bold">Your Borrowed Books</h2>
        <BorrowStatus />
      </section>
    </div>
  );
}
