import React from "react";
import { FaRegCalendar } from "react-icons/fa6";
import { TbInbox, TbLogout, TbSearch } from "react-icons/tb";
import { BiCalendarWeek } from "react-icons/bi";
import { format } from "date-fns";
import Link from "next/link";
export default function SideNav() {
  const mainNavItems = [
    {
      label: "Search",
      icon: <TbSearch className="text-3xl" />,
      href: "",
    },
    {
      label: "Inbox",
      icon: <TbInbox className="text-3xl" />,
      href: "",
    },
    {
      label: "Today",
      icon: (
        <span className="relative">
          <FaRegCalendar className="text-3xl" />
          <span className="absolute bottom-0 left-[6px] text-sm">
            {format(new Date(), "d")}
          </span>
        </span>
      ),
      href: "",
    },
    {
      label: "Upcoming",
      icon: <BiCalendarWeek className="text-3xl" />,
      href: "",
    },
  ];
  return (
    <nav className="flex flex-col bg-orange-400/80 p-4">
      {/* branding */}
      <h4>Concord</h4>

      {/* main nav items*/}
      <div className="mt-12 flex flex-1 flex-col gap-2">
        {mainNavItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-2 rounded bg-white/20 p-2 transition-colors hover:bg-white/10">
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* bottom nav items */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          className="flex items-center gap-2 rounded bg-white/20 p-2 transition-colors hover:bg-white/10">
          <TbLogout className="text-3xl" />
          <span>Log out</span>
        </button>
      </div>
    </nav>
  );
}
