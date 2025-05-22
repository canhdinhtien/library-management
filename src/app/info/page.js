"use client";

import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Image from "next/image";
import {
  BookOpen,
  Wifi,
  Users,
  Calendar,
  Briefcase,
  Laptop,
  Smartphone,
  Coffee,
} from "lucide-react";

export default function Info() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-amber-50 to-white py-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About Digital Library Hub
            </h1>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Our mission is simple: To provide access to the written word for
              everyone who walks through our doors.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 px-6 sm:px-12">
          <div className="container mx-auto max-w-4xl">
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center">
                Our Mission
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                We offer a diverse collection of materials, from books and
                e-books to audiobooks and magazines; we strive to meet the
                varied interests and needs of our patrons. Beyond lending books,
                we host a range of programs and events to engage our community,
                including author talks, workshops, and storytimes for children.
                Our dedicated staff are available to assist with research,
                provide recommendations, and help you discover the joy of
                reading.
              </p>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-2xl sm:text-3xl font-bold mb-10 text-gray-800 text-center">
              Services Offered
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <ServiceCard
                icon={<Wifi className="h-10 w-10 text-orange-500" />}
                title="Free Wi-Fi"
                description="Access high-speed internet for research and more."
              />
              <ServiceCard
                icon={<Users className="h-10 w-10 text-orange-500" />}
                title="Meeting Rooms"
                description="Reserve rooms for your community meetings."
              />
              <ServiceCard
                icon={<BookOpen className="h-10 w-10 text-orange-500" />}
                title="Study Rooms"
                description="Quiet rooms for focused study and research."
              />
              <ServiceCard
                icon={<Calendar className="h-10 w-10 text-orange-500" />}
                title="Community Events"
                description="Join us for book fairs, family fun days, and more."
              />
              <ServiceCard
                icon={<Coffee className="h-10 w-10 text-orange-500" />}
                title="Workshops & Training"
                description="Learn new skills at our hands-on workshops."
              />
              <ServiceCard
                icon={<Briefcase className="h-10 w-10 text-orange-500" />}
                title="Career Development"
                description="Access resources for resume writing and job search."
              />
              <ServiceCard
                icon={<Laptop className="h-10 w-10 text-orange-500" />}
                title="Online Resources"
                description="Enjoy e-books, audiobooks, and more from the comfort of home."
              />
              <ServiceCard
                icon={<Smartphone className="h-10 w-10 text-orange-500" />}
                title="Mobile App"
                description="Use the library app for quick access to your library account and more."
              />
            </div>
          </div>
        </section>

        {/* Community Initiatives Section */}
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-2xl sm:text-3xl font-bold mb-10 text-gray-800 text-center">
              Community Initiatives
            </h2>
            <div className="space-y-8">
              <InitiativeCard
                imageSrc="/info/chair-of-reading.png"
                title="Chair of Reading"
                description="Our Chair of Reading program encourages children and adults alike to find a comfortable spot and immerse themselves in literature. We provide cozy reading nooks throughout the library and host regular reading sessions for all ages."
              />
              <InitiativeCard
                imageSrc="/info/book-fair.png"
                title="Book Fair Festival"
                description="Our annual Book Fair Festival brings together authors, publishers, and readers for a celebration of literature. Featuring book signings, panel discussions, workshops, and activities for children, it's a highlight of our community calendar."
              />
              <InitiativeCard
                imageSrc="/info/create-a-thon.png"
                title="Create-a-thon"
                description="The Create-a-thon is an innovative event where participants collaborate to write, illustrate, and publish their own stories in just 24 hours. This initiative fosters creativity, teamwork, and a deeper appreciation for the art of storytelling."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl overflow-hidden shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 items-center">
                <div className="p-8 md:p-10">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                    Join Our Library Community
                  </h2>
                  <p className="text-white/90 mb-6 text-lg">
                    Become a part of our vibrant library programs and volunteer
                    opportunities. Sign up to make a difference and connect with
                    fellow book lovers today!
                  </p>
                  <button
                    onClick={() => router.push("/register")}
                    className="bg-white text-orange-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-md"
                  >
                    Join for Free
                  </button>
                </div>
                <div className="relative h-64 md:h-full">
                  <Image
                    src="/info/community.png"
                    fill
                    className="object-cover"
                    alt="People enjoying community activities at the library"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// Service Card Component
function ServiceCard({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4">{icon}</div>
        <h3 className="font-semibold text-lg text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}

// Initiative Card Component
function InitiativeCard({ imageSrc, title, description }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-1/4 p-6 flex items-center justify-center">
          <div className="relative w-24 h-24 sm:w-full sm:h-32">
            <Image
              src={imageSrc || "/placeholder.svg"}
              fill
              className="object-cover rounded-lg"
              alt={title}
              sizes="(max-width: 640px) 100px, 200px"
            />
          </div>
        </div>
        <div className="sm:w-3/4 p-6">
          <h3 className="font-semibold text-xl text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}
