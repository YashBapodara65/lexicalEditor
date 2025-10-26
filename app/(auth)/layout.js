import ThemeTogglerTwo from "../_components/reusable/ThemeTogglerTwo";
import Image from "next/image";
import Link from "next/link";

export default function Layout({ children }) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-950 dark:bg-white/5 lg:flex">
          <div className="relative flex items-center justify-center z-1 w-full h-full">
            <div className="absolute right-0 top-0 -z-1 w-full max-w-[250px] xl:max-w-[450px]">
              <Image
                src="/images/shape/grid-01.svg"
                alt="grid"
                width={450}
                height={450}
                className="w-full h-auto"
              />
            </div>
            <div className="absolute bottom-0 left-0 -z-1 w-full max-w-[250px] rotate-180 xl:max-w-[450px]">
              <Image
                src="/images/shape/grid-01.svg"
                alt="grid"
                width={450}
                height={450}
                className="w-full h-auto"
              />
            </div>
            <div className="flex flex-col items-center max-w-xs">
              <Link href="/" className="block mb-4">
                <h4 className="text-2xl font-semibold text-gray-200">
                  Pharma QMT
                </h4>
              </Link>
              <p className="text-center text-gray-400 dark:text-white/60">
                A smart and user-friendly tool to monitor, track, and improve quality processes across your organization.
              </p>
            </div>
          </div>
        </div>
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
