"use client";

import { useSession } from "next-auth/react";
import VerticalNavbar from "./VerticalNavbar";

export default function NavbarContainer() {
  const { data: session, status } = useSession();

  console.log("Session status:", status);
  console.log("Session data:", session);

  // Show loading state while session is being fetched
  if (status === "loading") {
    return <div>Loading navigation...</div>;
  }

  return <VerticalNavbar session={session} />;
}