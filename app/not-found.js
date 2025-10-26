"use client";

import Link from "next/link";
import Head from "next/head";
import Image from "next/image";

export default function NotFound() {
  return (
    <>
      {/* SEO meta info */}
      <Head>
        <title>404 | Page Not Found</title>
        <meta
          name="description"
          content="We can’t seem to find the page you are looking for."
        />
      </Head>

      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
        {/* Simple background shape */}
        <div className="absolute inset-0 bg-dynamic" />

        <div className="relative z-10 mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
          <h1 className="mb-8 font-bold text-black dark:text-gray-100 text-title-md xl:text-title-2xl">
            ERROR
          </h1>
          <Image
            src="/images/error/404.svg"
            alt="404"
            width={400}
            height={400}
            className="dark:hidden mx-auto"
            style={{ width: "100%", height: "auto" }} // keeps aspect ratio
          />
          <Image
            src="/images/error/404-dark.svg"
            alt="404"
            width={400}
            height={400}
            className="hidden dark:block mx-auto"
            style={{ width: "100%", height: "auto" }} // keeps aspect ratio
          />
          <p className="mt-10 mb-6 text-base dark:text-gray-400 sm:text-lg">
            We can’t seem to find the page you are looking for!
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-transparent px-5 py-3.5 text-sm font-medium text-gray-800 shadow-theme-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
          >
            Back to Home Page
          </Link>
        </div>

        {/* Footer */}
        <p className="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400">
          &copy; {new Date().getFullYear()} - Pharma QMT
        </p>
      </div>
    </>
  );
}
