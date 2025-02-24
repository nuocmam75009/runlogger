import Link from "next/link";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Homepage() {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light">
      <h1 className="display-4 fw-bold mb-4 p-2 border border-primary rounded">Homepage</h1>
      <p className="fs-5 text-secondary mb-4">Get analytics on your workouts!</p>
      <div className="d-flex gap-3">
        <Link href="/Login" legacyBehavior>
          <a className="btn btn-primary px-4 py-2">
            Log In
          </a>
        </Link>
        <Link href="/Register" legacyBehavior>
          <a className="btn btn-success px-4 py-2">
            Create an Account
          </a>
        </Link>
      </div>
    </div>
  );
}