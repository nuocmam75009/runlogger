"use client";

import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import Image from "next/image";
import { Session } from "next-auth";
import {
  MdHome,
  MdDashboard,
  MdPerson,
  MdGroups,
  MdSettings,
  MdLogin,
  MdLogout
} from "react-icons/md";

interface VerticalNavbarProps {
  session: Session | null;
}

export default function VerticalNavbar({ session }: VerticalNavbarProps) {
  const isLoggedIn = !!session?.user;

  return (
    <div
      className="d-flex flex-column align-items-center vh-100 p-3 bg-grey-300"
      style={{ width: "250px" }}
    >
      <div className="mb-4 mt-3">
        <Link href="/" passHref>
          <span className="h4 text-primary fw-bold">RunLogger</span>
        </Link>
      </div>

      <div className="flex-grow-1 d-flex flex-column justify-content-center w-100">
        <ul className="nav nav-pills flex-column mb-auto w-100">
          <li className="nav-item mb-2">
            <Link href="/" passHref legacyBehavior>
              <a className="nav-link d-flex align-items-center">
                <MdHome className="me-2" size={20} />
                Home
              </a>
            </Link>
          </li>

          {isLoggedIn ? (
            <>
              <li className="nav-item mb-2">
                <Link href="/UserDashboard" passHref legacyBehavior>
                  <a className="nav-link d-flex align-items-center">
                    <MdDashboard className="me-2" size={20} />
                    My Dashboard
                  </a>
                </Link>
              </li>

              <li className="nav-item mb-2">
                <Link href="/Profile" passHref legacyBehavior>
                  <a className="nav-link d-flex align-items-center">
                    <MdPerson className="me-2" size={20} />
                    My Athlete Profile
                  </a>
                </Link>
              </li>

              <li className="nav-item mb-2">
                <Link href="/Community" passHref legacyBehavior>
                  <a className="nav-link d-flex align-items-center">
                    <MdGroups className="me-2" size={20} />
                    Community
                  </a>
                </Link>
              </li>

              <li className="nav-item mb-2">
                <Link href="/Settings" passHref legacyBehavior>
                  <a className="nav-link d-flex align-items-center">
                    <MdSettings className="me-2" size={20} />
                    Settings
                  </a>
                </Link>
              </li>

              <li className="nav-item mt-4">
                <Link href="/api/auth/signout" passHref legacyBehavior>
                  <a className="nav-link d-flex align-items-center text-danger">
                    <MdLogout className="me-2" size={20} />
                    Log Out
                  </a>
                </Link>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item mb-2">
                <Link href="/Login" passHref legacyBehavior>
                  <a className="nav-link d-flex align-items-center">
                    <MdLogin className="me-2" size={20} />
                    Log In
                  </a>
                </Link>
              </li>

              <li className="nav-item mb-2">
                <Link href="/RegisterPage" passHref legacyBehavior>
                  <a className="nav-link d-flex align-items-center">
                    <MdPerson className="me-2" size={20} />
                    Register
                  </a>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>

      {isLoggedIn && (
        <div className="mt-auto mb-3 d-flex align-items-center">
          <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-2"
               style={{ width: "32px", height: "32px" }}>
            {session?.user?.name?.charAt(0) || "U"}
          </div>
          <div className="small">
            <div className="fw-bold">{session?.user?.name}</div>
            <div className="text-muted small">{session?.user?.email}</div>
          </div>
        </div>
      )}
    </div>
  );
}
