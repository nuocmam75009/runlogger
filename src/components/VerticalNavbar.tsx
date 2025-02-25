"use client";

import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import Image from "next/image";
import { MdFitnessCenter, MdLogout, MdDirectionsBike } from "react-icons/md";
import { FaApple } from "react-icons/fa";

export default function VerticalNavbar() {
  return (
    <div
      className="d-flex flex-column align-items-center vh-100 p-3 bg-grey-300"
      style={{ width: "250px" }}
    >
      <div className="mb-4">
        <Link href="/" passHref>
          <Image src="/logo.png" alt="Logo" width={100} height={100} />
        </Link>
      </div>
      <div className="flex-grow-1 d-flex flex-column justify-content-center">
        <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item">
            <Link href="/UserDashboard" passHref legacyBehavior>
              <a className="nav-link active">
                <MdFitnessCenter className="me-2" />
                My Workouts
              </a>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/connect-apple-health" passHref legacyBehavior>
              <a className="nav-link">
                <FaApple className="me-2" />
                Connect to Apple Health
              </a>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/connect-strava" passHref legacyBehavior>
              <a className="nav-link">
                <MdDirectionsBike className="me-2" />
                Connect to Strava
              </a>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/api/auth/logout" passHref legacyBehavior>
              <a className="nav-link">
                <MdLogout className="me-2" />
                Log Out
              </a>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
