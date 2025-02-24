import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-between p-8">
      {/* Header */}
      <header className="w-full max-w-4xl mx-auto text-center py-8">
        <h1 className="text-4xl font-bold text-gray-800">Strava Metrics</h1>
        <p className="text-lg text-gray-600 mt-2">
          Track your running performance with ease
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* Metrics Display */}
        <section className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Runs</h2>
          <ul className="space-y-4">
            <li className="flex justify-between items-center">
              <span className="text-gray-700">Total Distance:</span>
              <span className="font-bold text-gray-900">42 km</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-700">Total Time:</span>
              <span className="font-bold text-gray-900">3h 15m</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-700">Average Pace:</span>
              <span className="font-bold text-gray-900">4:30 /km</span>
            </li>
          </ul>
        </section>

        {/* Image or Additional Info */}
        <section className="flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Running illustration"
            width={200}
            height={200}
            className="dark:invert"
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto text-center py-4">
        <p className="text-sm text-gray-500">
          Powered by Strava API | Designed by [Lucas]
        </p>
      </footer>
    </div>
  );
}