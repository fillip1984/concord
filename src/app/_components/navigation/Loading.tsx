import React from "react";
import { FaCircleNotch } from "react-icons/fa6";

export default function Loading() {
  return (
    <div className="flex h-screen flex-1 items-center justify-center">
      <FaCircleNotch className="animate-spin text-8xl" />
    </div>
  );
}
