import { UserProvider } from "@/contexts/UserContext";
import Header from "../components/Header";
import "../src/globals.css";
import type { AppProps } from "next/app";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <UserProvider>
        <Header />
        <Component {...pageProps} />
        <ToastContainer autoClose={2000} closeOnClick position="top-center" />
      </UserProvider>
    </>
  );
}

export default MyApp;
