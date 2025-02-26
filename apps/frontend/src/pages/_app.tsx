import 'bootstrap/dist/css/bootstrap.min.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';
import NavbarContainer from "../components/NavbarContainer";

function MyApp({ Component, pageProps }: AppProps) {

  useEffect(() => {
    // This is necessary for Bootstrap dropdowns, popovers, tooltips, etc.
    if (typeof window !== 'undefined') {
      require('bootstrap/dist/js/bootstrap.bundle.min.js');
    }
  }, []);

  return (
    <SessionProvider session={pageProps.session}>
      <div className="d-flex" style={{ backgroundColor: "#f0f0f0", minHeight: "100vh" }}>
        <NavbarContainer />
        <div className="flex-grow-1">
          <Component {...pageProps} />
        </div>
      </div>
    </SessionProvider>
  );
}

export default MyApp;
