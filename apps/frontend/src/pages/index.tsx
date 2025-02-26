import Link from "next/link";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useSession } from "next-auth/react";
import { Button } from "react-bootstrap";
import { useRouter } from "next/router";

export default function Homepage() {
  const { data: session } = useSession();
  const router = useRouter();

  const isLoggedIn = !!session?.user;

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100 bg-grey-200">
      <h1 className="display-4 fw-bold mb-4 p-2 border border-grey-200 bg-blue-100 rounded">iTrack</h1>
      <p className="fs-5 text-secondary mb-4">360° analysis of your Health data</p>
      <p className="fs-5 text-secondary mb-4 w-50 text-center">
        Connect all your fitness apps, get real time insights about your workouts and achieve your goals!
      </p>

      {isLoggedIn ? (
        <div className="d-flex flex-column align-items-center gap-3 bg-grey-100 p-4 border border-black shadow-sm rounded-3">
          <h2 className="text-center">Hi, {session.user.name}! 👋</h2>
          <p className="text-center">Welcome back to your fitness journey</p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push("/UserDashboard")}
            className="px-4"
          >
            Go to Dashboard
          </Button>
        </div>
      ) : (
        <div className="d-flex gap-3 bg-grey-100 p-4 border border-black shadow-sm rounded-3">
          <Link href="/Login" legacyBehavior>
            <a className="btn btn-primary px-4 py-2 shadow-sm">Log In</a>
          </Link>
          <Link href="/RegisterPage" legacyBehavior>
            <a className="btn btn-success px-4 py-2 shadow-sm">Create an Account</a>
          </Link>
        </div>
      )}
    </div>
  );
}