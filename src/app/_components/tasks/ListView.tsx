import { useState } from "react";
import { BiDuplicate } from "react-icons/bi";
import { FaChevronDown, FaPlus, FaTrashCan } from "react-icons/fa6";
import { FiEdit3 } from "react-icons/fi";
import { IoEllipsisHorizontalOutline } from "react-icons/io5";
import { MdDriveFileMoveOutline } from "react-icons/md";
import { type ListSectionType } from "~/trpc/types";
import TaskCard from "./TaskCard";
import { api } from "~/trpc/react";

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

  const utils = api.useUtils();
  const { mutate: deleteSection } = api.section.delete.useMutation({
    onSuccess: async () => {
      await utils.list.invalidate();
      // TODO: might need to add more here
      setIsModalOpen(false);
    },
  });
  const handleDeleteSection = () => {
    console.log("deleting section");
    deleteSection({ id: section.id });
  };

  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={handleSectionCollapse}>
          <FaChevronDown
            className={`transition ${isCollapsed ? "-rotate-90" : ""}`}
          />
        </button>
        <span>{section.heading}</span>
        <div className="relative ml-auto">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="text-2xl">
            <IoEllipsisHorizontalOutline />
          </button>
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
                  onClick={() => {
                    setIsOpen(false);
                    setIsModalOpen(true);
                  }}
                  className="flex w-full items-center gap-2 rounded p-1 text-red-400 hover:bg-stone-700">
                  <FaTrashCan />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
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

      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center">
          <div
            className="fixed inset-0 bg-slate-800/60"
            onClick={() => setIsModalOpen(false)}></div>
          <div className="z-[2001] w-[400px] rounded-lg bg-slate-700 p-2">
            Are you sure you want to delete both this section and all contained
            tasks?
            <div className="mt-4 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded border border-white px-4 py-2">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSection}
                className="rounded bg-red-400 px-4 py-2">
                Delete
              </button>
            </div>
          </div>
        </div>
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
