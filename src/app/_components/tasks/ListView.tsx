import { useState } from "react";
import { FaChevronDown, FaPlus, FaTrashCan } from "react-icons/fa6";
import { type ListSectionType } from "~/trpc/types";
import TaskCard from "./TaskCard";
import { useClick, useFloating, useInteractions } from "@floating-ui/react";
import { MdDriveFileMoveOutline } from "react-icons/md";
import { IoEllipsisHorizontalOutline } from "react-icons/io5";
import { BiDuplicate } from "react-icons/bi";
import { FiEdit3 } from "react-icons/fi";

export default function ListView({
  listSections,
}: {
  listSections: ListSectionType[];
}) {
  return (
    <div>
      <div className="flex flex-col gap-6">
        {listSections.map((listSection) => (
          <Section key={listSection.id} section={listSection} />
        ))}
      </div>
    </div>
  );
}

const Section = ({ section }: { section: ListSectionType }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSectionCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const [isOpen, setIsOpen] = useState(false);

  // const { refs, floatingStyles, context } = useFloating({
  //   open: isOpen,
  //   onOpenChange: setIsOpen,
  // });

  // const click = useClick(context);

  // const { getReferenceProps, getFloatingProps } = useInteractions([click]);

  return (
    <div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={handleSectionCollapse}>
          <FaChevronDown
            className={`transition ${isCollapsed ? "-rotate-90" : ""}`}
          />
        </button>
        <span>{section.heading}</span>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative ml-auto text-2xl"
          // ref={refs.setReference}
          // {...getReferenceProps()}
        >
          <IoEllipsisHorizontalOutline />
          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-[1000]"
                onClick={() => setIsOpen(false)}></div>
              <div className="absolute right-0 z-[1001] m-1 flex w-[250px] flex-col items-start rounded-lg border border-white bg-stone-800 p-2 text-sm">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded p-1 hover:bg-stone-700">
                  <FiEdit3 />
                  Edit
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded p-1 hover:bg-stone-700">
                  <MdDriveFileMoveOutline />
                  Move to...
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded p-1 hover:bg-stone-700">
                  <BiDuplicate />
                  Duplicate
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded p-1 text-red-400 hover:bg-stone-700">
                  <FaTrashCan />
                  Delete
                </button>
              </div>
            </>
          )}
        </button>
      </div>
      {!isCollapsed && (
        <>
          <div>
            {section.tasks.map((task) => (
              <div key={task.id}>
                <hr />
                <div className="flex gap-2 py-2">
                  <input type="checkbox" className="rounded-full" />
                  <div className="flex flex-col">
                    <span className="text-xs">{task.text}</span>
                    <span>{task.description}</span>
                  </div>
                </div>
                <hr />
              </div>
            ))}
          </div>
          <AddTask />
        </>
      )}
    </div>
  );
};

const AddTask = () => {
  const [isAddTaskCardVisible, setIsAddTaskCardVisible] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsAddTaskCardVisible((prev) => !prev)}
        className="flex items-center gap-2 text-gray-600">
        <FaPlus />
        Add Task
      </button>
      {isAddTaskCardVisible && <TaskCard />}
    </>
  );
};
