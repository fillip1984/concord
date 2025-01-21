"use client";

import { GiSettingsKnobs } from "react-icons/gi";
import Today from "./today/page";

export default function Home() {
  return (
    <div className="flex h-screen w-screen flex-1 flex-col gap-2 bg-purple-600 p-4">
      <div className="flex justify-end">
        <GiSettingsKnobs />
      </div>

      <Today />
    </div>
  );
}
