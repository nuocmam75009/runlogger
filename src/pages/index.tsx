import Link from "next/link";

export default function Homepage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4 border border-red-400">Homepage</h1>
      <p className="text-lg text-gray-700 mb-6">Lol landing page</p>
      <Link href="/login" legacyBehavior>
        <a className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Go to login or register
        </a>
      </Link>
    </div>
  );
}
