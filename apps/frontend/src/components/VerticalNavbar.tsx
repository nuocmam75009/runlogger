"use client";

import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import Image from "next/image";
import { MdFitnessCenter, MdLogout, MdDirectionsBike, MdWatch, MdLogin } from "react-icons/md";
import { Session } from "next-auth";

interface VerticalNavbarProps {
  session: Session | null;
}

export default function VerticalNavbar({ session }: VerticalNavbarProps) {
  const isLoggedIn = !!session?.user;
  console.log(session);
  console.log(isLoggedIn);

  return (
    <div
      className="d-flex flex-column align-items-center vh-100 p-3 bg-grey-300"
      style={{ width: "250px" }}
    >
{/*       <div className="mb-4">
        <Link href="/" passHref>
          <Image src="/png-transparent-logo-run-logo-text-logo.png" alt="Logo" width={100} height={100} />
        </Link>
      </div> */}
      <div className="flex-grow-1 d-flex flex-column justify-content-center">
        <ul className="nav nav-pills flex-column mb-auto">
          {isLoggedIn ? (
            <>
              <li className="nav-item">
                <Link href="/UserDashboard" passHref legacyBehavior>
                  <a className="nav-link active">
                    <MdFitnessCenter className="me-2" />
                    My Workouts
                  </a>
                </Link>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  id="smartwatchDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <MdWatch className="me-2" />
                  Connect my SmartWatch
                </a>
                <ul className="dropdown-menu" aria-labelledby="smartwatchDropdown">
                  <li>
                    <Link href="/connect-apple" passHref legacyBehavior>
                      <a className="dropdown-item">Apple Watch</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/connect-coros" passHref legacyBehavior>
                      <a className="dropdown-item">COROS</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/connect-garmin" passHref legacyBehavior>
                      <a className="dropdown-item">Garmin</a>
                    </Link>
                  </li>
                </ul>
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
                <Link href="/api/auth/signout" passHref legacyBehavior>
                  <a className="nav-link">
                    <MdLogout className="me-2" />
                    Log Out
                  </a>
                </Link>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link href="/Login" passHref legacyBehavior>
                  <a className="nav-link">
                    <MdLogin className="me-2" />
                    Log In
                  </a>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/RegisterPage" passHref legacyBehavior>
                  <a className="nav-link">
                    <MdFitnessCenter className="me-2" />
                    Register
                  </a>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
