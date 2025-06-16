// app/error.tsx (or pages/_error.tsx for older versions)

"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <html>
      <body className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <p className="mb-4 text-gray-600">{error.message}</p>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          onClick={() => reset()}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
