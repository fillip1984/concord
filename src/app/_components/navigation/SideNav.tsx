"use client";

import { format } from "date-fns";
import Link from "next/link";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { BiCalendarWeek } from "react-icons/bi";
import { FaPencil, FaPlus, FaRegCalendar, FaTrash } from "react-icons/fa6";
import { TbInbox, TbLogout, TbSearch } from "react-icons/tb";
import { api } from "~/trpc/react";
import { type ListSummaryType } from "~/trpc/types";

export default function SideNav() {
  const { data: lists } = api.list.readAll.useQuery();
  const utils = api.useUtils();
  const { mutate: addList } = api.list.create.useMutation({
    onSuccess: async () => {
      setListSearchAdd("");
      await utils.list.invalidate();
    },
  });
  const [listSearchAdd, setListSearchAdd] = useState("");
  const handleAddList = () => {
    console.log("adding list");
    addList({ name: listSearchAdd });
  };
  const [listToEdit, setListToEdit] = useState<ListSummaryType>();

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
    <>
      <nav className="flex flex-col bg-orange-500 p-4 text-white">
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
          <hr />
          <h4>Lists</h4>

          <div className="flex">
            <input
              type="text"
              value={listSearchAdd}
              onChange={(e) => setListSearchAdd(e.target.value)}
              placeholder="Search or add list..."
              className="rounded-r-none text-sm"
            />
            <button
              type="button"
              onClick={handleAddList}
              className="flex w-8 items-center justify-center rounded-r-lg border">
              <FaPlus />
            </button>
          </div>
          {lists
            ?.filter((list) => list.parentListId === null)
            .map((list) => (
              <>
                <div key={list.id} className="flex justify-between gap-2">
                  <span>{list.name}</span>
                  <button type="button" onClick={() => setListToEdit(list)}>
                    <FaPencil />
                  </button>
                </div>
                {list.childLists?.map((childList) => (
                  <div
                    key={childList.id}
                    className="ml-4 flex justify-between gap-2">
                    <span>{childList.name}</span>
                    <button
                      type="button"
                      onClick={() => setListToEdit(childList)}>
                      <FaPencil />
                    </button>
                  </div>
                ))}
              </>
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

      {listToEdit && (
        <div className="absolute inset-0 z-[1000] flex h-screen w-screen items-center justify-center">
          {/* backdrop */}
          <div
            onClick={() => setListToEdit(undefined)}
            className="absolute inset-0 z-[1000] h-screen w-screen bg-black/80"></div>

          {/* modal */}
          <ListDetailsModal list={listToEdit} setListToEdit={setListToEdit} />
        </div>
      )}
    </>
  );
}

const ListDetailsModal = ({
  list,
  setListToEdit,
}: {
  list: ListSummaryType;
  setListToEdit: Dispatch<SetStateAction<ListSummaryType | undefined>>;
}) => {
  const { data: lists } = api.list.readAll.useQuery();
  const [name, setName] = useState("");
  const [parentListId, setParentListId] = useState("");

  useEffect(() => {
    setName(list.name);
    setParentListId(list.parentListId ?? "");
  }, [list, lists]);

  const utils = api.useUtils();
  const { mutate: updateList } = api.list.update.useMutation({
    onSuccess: async () => {
      await utils.list.invalidate();
      setListToEdit(undefined);
    },
  });
  const handleSave = () => {
    console.log("saving");
    updateList({ id: list.id, name, parentListId });
  };

  const { mutate: deleteList } = api.list.delete.useMutation({
    onSuccess: async () => {
      await utils.list.invalidate();
      setListToEdit(undefined);
    },
  });
  const handleDelete = () => {
    deleteList({ id: list.id });
  };

  return (
    <div className="z-[1001] flex h-1/2 w-3/4 flex-col gap-2 rounded bg-stone-800 p-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <select
        value={parentListId}
        onChange={(e) => setParentListId(e.target.value)}>
        <option></option>
        {lists
          ?.filter((l) => l.id !== list.id)
          .map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
      </select>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleSave}
          className="rounded bg-orange-400 px-4 py-2 text-white">
          Save
        </button>
        <button type="button" onClick={handleDelete}>
          <FaTrash className="text-red-400" />
        </button>
      </div>
    </div>
  );
};
