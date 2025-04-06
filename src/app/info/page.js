import Navbar from "../../components/Navbar";
import Image from 'next/image';
import Link from "next/link";
import Head from "next/head";

export const metadata = {
  title: "Info",
  description: "Trang thông tin của trang web",
};

export default function Info() {
  return (
    <div className="m-2">
      <Navbar />

      <section className="text-center p-6 sm:p-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">
          Our Mission Is Simple: To Provide Access to the Written Word for Everyone Who Walks Through Our Doors
        </h2>
        <p className="text-gray-600 max-w-3xl mx-auto text-sm sm:text-base">
          We offer a diverse collection of materials, from books and e-books to audiobooks and magazines; we strive to meet the varied interests and needs of our patrons. Beyond lending books, we host a range of programs and events to engage our community, including author talks, workshops, and storytimes for children. Our dedicated staff are available to assist with research, provide recommendations, and help you discover the joy of reading.
        </p>
      </section>

      <section className="text-center py-12">
        <h3 className="text-lg sm:text-xl font-bold mb-6 text-gray-800">Services Offered</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <p className="font-semibold text-gray-800">Free Wi-Fi</p>
            <p className="text-gray-500">Access high-speed internet for research and more.</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-800">Meeting Rooms</p>
            <p className="text-gray-500">Reserve rooms for your community meetings.</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-800">Study Rooms</p>
            <p className="text-gray-500">Quiet rooms for focused study and research.</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-800">Community Events</p>
            <p className="text-gray-500">Join us for book fairs, family fun days, and more.</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-800">Workshops & Training</p>
            <p className="text-gray-500">Learn new skills at our hands-on workshops.</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-800">Career Development</p>
            <p className="text-gray-500">Access resources for resume writing and job search.</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-800">Online Resources</p>
            <p className="text-gray-500">Enjoy e-books, audiobooks, and more from the comfort of home.</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-800">Mobile App</p>
            <p className="text-gray-500">Use the library app for quick access to your library account and more.</p>
          </div>
        </div>
      </section>

      <section className="py-12 max-w-4xl mx-auto">
        <h3 className="text-lg sm:text-xl text-gray-800 font-bold text-center mb-6">Community Initiatives</h3>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center space-x-4">
            <Image src="/info/chair-of-reading.png" width={100} height={100} className="rounded-md" alt="Chair of Reading" />
            <div>
              <p className="font-semibold text-gray-800">Chair of Reading</p>
              <p className="text-gray-500">Dolore magna sit veniam aute laboris aliquip ex excepteur et fugiat laborum officia reprehenderit cupidatat. Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center space-x-4">
            <Image src="/info/book-fair.png" width={100} height={100} className="rounded-md" alt="Book Fair" />
            <div>
              <p className="font-semibold text-gray-800">Book Fair Festival</p>
              <p className="text-gray-500">Dolore magna sit veniam aute laboris aliquip ex excepteur et fugiat laborum officia reprehenderit cupidatat. Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center space-x-4">
            <Image src="/info/create-a-thon.png" width={100} height={100} className="rounded-md" alt="Create A Thon" />
            <div>
              <p className="font-semibold text-gray-800">Create-a-thon</p>
              <p className="text-gray-500">Dolore magna sit veniam aute laboris aliquip ex excepteur et fugiat laborum officia reprehenderit cupidatat. Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-yellow-500 text-white text-center p-8 mt-12 grid grid-cols-1 sm:grid-cols-2 items-center max-w-4xl mx-auto rounded-lg">
        <div>
          <h3 className="text-lg sm:text-xl font-bold">Join Our Library Community</h3>
          <p className="text-sm sm:text-base">Become a part of our vibrant library programs and volunteer opportunities. Sign up to make a difference and connect with fellow book lovers today!</p>
          <button className="bg-white text-yellow-500 px-4 py-2 rounded-lg mt-4">Join for Free</button>
        </div>
        <Image src="/info/community.png" width={1000} height={1000} className="rounded-md mt-4 sm:mt-0" alt="Community" />
      </section>
    </div>
  );
}
