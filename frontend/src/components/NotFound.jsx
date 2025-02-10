import { NavLink } from "react-router-dom";

export const NotFound = () => {
  return (
    <>
      <section className="w-full pb-[70px] sm:ml-[70px] sm:pb-0 lg:ml-0">
        <div className="flex h-full items-center justify-center">
          <div className="w-full max-w-sm text-center flex flex-col gap-4">
            <p className="mb-3 w-full">
              <span className="inline-flex rounded-full bg-[#E4D3FF] p-2 text-[#AE7AFF]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                  className="w-12 h-12"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v4m0 4h.01M10.29 3.86a1.5 1.5 0 012.42 0l7.38 10.47A1.5 1.5 0 0118.38 17H5.62a1.5 1.5 0 01-1.21-2.67L10.29 3.86z"
                  ></path>
                </svg>
              </span>
            </p>
            <h5 className="mb-2 font-semibold text-2xl">Not Found</h5>
            <p>
              The page you are looking for does not exist or has been moved.
            </p>
            <NavLink to={"/"}>
              <button className="mr-1 w-full bg-[#ae7aff] px-3 py-2 text-center font-bold text-black shadow-[5px_5px_0px_0px_#4f4e4e] transition-all duration-150 ease-in-out active:translate-x-[5px] active:translate-y-[5px] active:shadow-[0px_0px_0px_0px_#4f4e4e] sm:w-auto">
                Go Home
              </button>
            </NavLink>
          </div>
        </div>
      </section>
    </>
  );
};
