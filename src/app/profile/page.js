import BorrowStatus from "../../components/BorrowStatus";
import Navbar from "../../components/Navbar";

const borrowedBooks = [
  {
    id: 1,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    image: "/books/mockingbird.jpg",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    dueDate: "2021-09-30",
  },
  {
    id: 2,
    title: "1984",
    author: "George Orwell",
    image: "/books/1984.jpg",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    dueDate: "2021-10-01",
  },
  {
    id: 3,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    image: "/books/pride.jpg",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    dueDate: "2021-10-02",
  },
  {
    id: 4,
    title: "Moby-Dick",
    author: "Herman Melville",
    image: "/books/mobydick.jpg",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    dueDate: "2021-10-03",
  },
];

const overdueBooks = [
  {
    id: 1,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    image: "/books/mockingbird.jpg",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    daysOverdue: 2,
  },
  {
    id: 2,
    title: "1984",
    author: "George Orwell",
    image: "/books/1984.jpg",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    daysOverdue: 1,
  },
  {
    id: 3,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    image: "/books/pride.jpg",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    daysOverdue: 4,
  },
  {
    id: 4,
    title: "Moby-Dick",
    author: "Herman Melville",
    image: "/books/mobydick.jpg",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    daysOverdue: 3,
  },
];

const stats = {
  totalBorrowed: 2,
  averageDays: 2.5,
  genres: ["fiction", "nonfiction", "poetry"],
};

export default function Profile() {
  return (
    <div>
      <Navbar />
      <BorrowStatus
        borrowedBooks={borrowedBooks}
        overdueBooks={overdueBooks}
        stats={stats}
      />
    </div>
  );
}