import Navbar from "../../components/Navbar";
import Link from "next/link";
import Head from "next/head";

export const metadata = {
  title: "Fogotten Password",
  description: "Trang lấy lại mật khẩu",
};

export default function fogotpass() {
  return (
    <div>
      <Navbar />
      <section className="flex flex-col items-center justify-center h-screen ">
        <h2 className="text-4xl text-black mb-10">Chọn cách bạn muốn lấy lại tài khoản</h2>
        
      </section>
    </div>
  );
}