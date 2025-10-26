import { Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./_context/ThemeContext";
import NextTopLoader from "nextjs-toploader";
import ServerLayoutWrapper from "./_layout/ServerLayoutWrapper";
import { ToastContainer } from "react-toastify";

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${outfit.className} dark:bg-gray-900`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <NextTopLoader
            showSpinner={false}
            color="#3b82f6"
            height={3}
            zIndex={10000} // keep lower than sidebar z-index
          />
          <ServerLayoutWrapper>{children}</ServerLayoutWrapper>
          <ToastContainer
            position="top-right"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            style={{ zIndex: 999999 }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
