import { AppProps } from "next/app";
import "bootstrap/dist/css/bootstrap.min.css";
import VerticalNavbar from "../components/VerticalNavbar";
import { SessionProvider } from "next-auth/react";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <div className="d-flex" style={{ backgroundColor: "#f0f0f0", minHeight: "100vh" }}>
        <VerticalNavbar />
        <div className="flex-grow-1">
          <Component {...pageProps} />
        </div>
      </div>
    </SessionProvider>
  );
}

export default MyApp;
