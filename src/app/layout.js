import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner"; // ✅ Import Toaster từ sonner

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Digital Library Hub",
  description: "Generated by digital library hub",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          {/* ✅ Thêm Toaster sau cùng để hiển thị toast */}

          <Toaster
            position="top-center"
            richColors
            duration={3000}
            closeButton
            closeOnClick
            theme="light"
            toastOptions={{
              style: {
                maxWidth: "95vw",
                width: "fit-content",
                minWidth: "300px",
                zIndex: 999999,
                wordBreak: "break-word",
                lineHeight: "1.7",
                fontSize: "1.15rem",
                padding: "20px 30px",
                boxShadow:
                  "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
                border: "1px solid rgba(0, 0, 0, 0.1)",
                position: "relative",
                top: "30px",
                backgroundColor: "#fff",
                opacity: 1,
                marginTop: "40px",
              },
              classNames: {
                toast:
                  "text-base md:text-lg px-8 py-6 rounded-2xl shadow-2xl font-medium bg-white text-gray-800 relative",
                success:
                  "bg-emerald-500 text-white border-l-4 border-emerald-700",
                error: "bg-red-500 text-white border-l-4 border-red-700",
                warning: "bg-amber-500 text-white border-l-4 border-amber-700",
                info: "bg-blue-500 text-white border-l-4 border-blue-700",
                title: "font-bold text-lg mb-1",
                description: "text-sm md:text-base font-normal",
                actionButton:
                  "text-sm md:text-base font-semibold px-4 py-2 rounded-lg bg-white text-gray-800 hover:bg-gray-100 transition-colors",
                cancelButton:
                  "text-sm md:text-base font-medium text-gray-100 hover:text-white",
                icon: "w-6 h-6 mr-3",
              },
              loading: {
                icon: "⏳",
                style: {
                  animationDuration: "750ms",
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
