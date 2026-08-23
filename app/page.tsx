import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <Image
        src="/next.svg"
        alt="Gym management logo"
        width={150}
        height={150}
        className="dark:invert mb-8"
        priority
      />
      <h1 className="text-4xl font-bold text-green-800 mb-4 tracking-tight">
        Gym QR Attendance
      </h1>
      <p className="text-zinc-600 text-lg mb-8 max-w-2xl text-center">
        Manage members, track attendance, and view analytics all in one place.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 max-w-2xl w-full justify-center">
        <a
          href="/auth"
          className="flex-1 py-3 px-6 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition-colors text-center"
        >
          Sign In / Register
        </a>
        <a
          href="/members"
          className="flex-1 py-3 px-6 border border-green-600 text-green-600 rounded font-medium hover:bg-green-100 transition-colors text-center"
        >
          View Members
        </a>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mt-8 max-w-2xl w-full justify-center">
        <a
          href="/attendance"
          className="flex-1 py-3 px-6 bg-white text-green-600 rounded font-medium hover:bg-green-50 transition-colors text-center"
        >
          Take Attendance
        </a>
        <a
          href="/admin"
          className="flex-1 py-3 px-6 border border-green-600 text-green-600 rounded font-medium hover:bg-green-100 transition-colors text-center"
        >
          Admin Panel
        </a>
      </div>
    </div>
  );
}
