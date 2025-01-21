"use client";

import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import ListView from "~/app/_components/tasks/ListView";
import { api } from "~/trpc/react";
import { type ListSectionType, type SectionType } from "~/trpc/types";

export default function ListPage({ params }: { params: { id: string } }) {
  const { data: list, isLoading } = api.list.readOne.useQuery(
    {
      id: params.id,
    },
    { enabled: !!params.id },
  );

  const utils = api.useUtils();
  const { mutate: addSection } = api.section.create.useMutation({
    onSuccess: async () => {
      await utils.list.invalidate();
    },
  });

  const handleAddSection = () => {
    console.log("adding section");
    addSection({ name: "No Section", listId: params.id, position: 0 });
  };

  // edit task stuff
  const [sectionToAddTaskTo, setSectionToAddTaskTo] =
    useState<SectionType | null>();

  const handleAddTask = (section: SectionType) => {
    setSectionToAddTaskTo(section);
  };

  const [listSections, setListSections] = useState<ListSectionType[]>();
  useEffect(() => {
    if (list) {
      // const overdueSection = {
      //   heading: "Overdue",
      //   tasks: tasks.filter(
      //     (task) => task.dueDate && isBefore(task.dueDate, new Date()),
      //   ),
      // };
      // const todaySection = {
      //   heading: format(new Date(), "MMM dd E"),
      //   tasks: tasks.filter(
      //     (task) => task.dueDate && isEqual(task.dueDate, new Date()),
      //   ),
      // };
      // setListSections([overdueSection, todaySection]);
      setListSections(
        list.sections.map((section) => {
          return {
            id: section.id,
            heading: section.name,
            tasks: section.tasks,
          };
        }),
      );
    }
  }, [list]);

  return (
    <div className="flex w-screen flex-1">
      {isLoading && <span>Loading...</span>}
      {!isLoading && (
        <div className="flex flex-col gap-6">
          <h4>{list?.name}</h4>
          <div>{listSections && <ListView listSections={listSections} />}</div>
          <button
            type="button"
            onClick={handleAddSection}
            className="flex items-center gap-2">
            <FaPlus className="text-red-400" />
            <span className="text-gray-300">Add Section</span>
          </button>
        </div>
      )}
    </div>
  );
}
