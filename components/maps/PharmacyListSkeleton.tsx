import { Fragment } from "react";

function PharmacyListSkeleton() {
  return (
    <>
      <div className="mx-auto mb-2 h-6 w-[50%] animate-pulse rounded-full bg-primary-800 shadow-md focus:outline-none active:shadow-none"></div>
      <ul role="status">
        {Array.from({ length: 5 }, (_, i) => (
          <Fragment key={i}>
            <li className="my-2 animate-pulse rounded-lg border-2 border-opacity-40 p-2">
              <div className="mb-2.5 h-2 max-w-[360px] rounded-full bg-gray-200 dark:bg-primary-700"></div>
              <div className="mb-2.5 h-2 max-w-[300px] rounded-full bg-gray-200 dark:bg-primary-700"></div>
              <div className="h-2 max-w-[150px] rounded-full bg-gray-200 dark:bg-primary-700"></div>
              <span className="sr-only">Loading...</span>
            </li>
          </Fragment>
        ))}
      </ul>
    </>
  );
}

export default PharmacyListSkeleton;
