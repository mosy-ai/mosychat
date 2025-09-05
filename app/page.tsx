import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f4f8fb] to-[#e0e7ef] px-4">
      <div className="max-w-2xl w-full flex flex-col items-center bg-white/80 rounded-3xl shadow-xl p-10 md:p-16 border border-gray-100">
        <Image
          src="/viettel-cx-logo.webp"
          alt="Logo"
          width={80}
          height={80}
          className="mb-6 drop-shadow-xl"
          priority
        />
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-4 text-gray-900 tracking-tight">
          Chào mừng đến với <span className="text-red-600">Viettel</span>
        </h1>
        <p className="text-lg md:text-xl text-center text-gray-600 mb-8">
          Viettel giúp bạn tìm câu trả lời, tìm cảm hứng và làm việc hiệu quả hơn.<br />
          Miễn phí, nhanh chóng và dễ sử dụng. Chỉ cần hỏi và Viettel có thể giúp bạn viết, học tập, brainstorming và nhiều hơn nữa.
        </p>
        <Link href="/login">
          <button className="mt-2 px-8 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-lg shadow transition duration-200">
            Đăng nhập
          </button>
        </Link>
      </div>
      <footer className="mt-12 text-sm text-gray-400">
        © {new Date().getFullYear()} Viettel. All rights reserved.
      </footer>
    </main>
  );
}