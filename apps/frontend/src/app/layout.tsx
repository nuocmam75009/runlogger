import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import VerticalNavbar from "../components/VerticalNavbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Connect your Watch and all your Health Apps to get the best out of your data!",
  description:
    "This app is a workout tracker that allows you to track your workouts and see your progress.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <VerticalNavbar />
      <body className="d-flex">
        <div className="flex-grow-1">{children}</div>
      </body>
    </html>
  );
}
