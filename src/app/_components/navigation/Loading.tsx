import React from "react";
import { FaCircleNotch, FaTriangleExclamation } from "react-icons/fa6";

export default function Loading({
  isLoading,
  isError,
  retry,
}: {
  isLoading: boolean;
  isError: boolean;
  retry: () => void;
}) {
  return (
    <div className="flex items-center justify-center text-white">
      {isLoading && <FaCircleNotch className="animate-spin text-8xl" />}

      {isError && (
        <div>
          <h3 className="flex items-center justify-center gap-2 uppercase">
            <FaTriangleExclamation /> error
          </h3>
          <div className="my-8">
            <p>An occurred has occurred, would you like to try?</p>
            <button
              type="button"
              onClick={retry}
              className="mt-1 w-full rounded bg-slate-400 px-4 py-2 text-3xl">
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
