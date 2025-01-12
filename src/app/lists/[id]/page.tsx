"use client";

import { use, useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
import TaskQuickForm from "~/app/_components/tasks/TaskQuickForm";
import { api } from "~/trpc/react";
import { type SectionType } from "~/trpc/types";

export default function ListView({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const listParams = use(params);
  const { data: list } = api.list.readOne.useQuery(
    {
      id: listParams.id,
    },
    { enabled: !!listParams.id },
  );

  const utils = api.useUtils();
  const { mutate: addSection } = api.section.create.useMutation({
    onSuccess: async () => {
      await utils.list.invalidate();
    },
  });

  const handleAddSection = () => {
    console.log("adding section");
    addSection({ name: "No Section", listId: listParams.id, position: 0 });
  };

  // edit task stuff
  const [sectionToAddTaskTo, setSectionToAddTaskTo] =
    useState<SectionType | null>();

  const handleAddTask = (section: SectionType) => {
    setSectionToAddTaskTo(section);
  };

  return (
    <div className="flex flex-1 flex-col gap-8 overflow-hidden bg-yellow-400">
      {list?.name} <button onClick={handleAddSection}>Add Section</button>
      <span>{list?.sections.length}</span>
      <div className="mx-auto flex w-full flex-col gap-2 md:w-1/2">
        {list?.sections.map((section) => (
          <div key={section.id} className="bg-green-300">
            {/* heading */}
            <div className="flex items-center gap-6">
              <FaChevronDown />
              {section.name}
            </div>

            {/* task list */}
            {section.tasks.map((task) => (
              <div key={task.id}>{task.text}</div>
            ))}

            {/* footer actions */}
            <button type="button" onClick={() => handleAddTask(section)}>
              Add task
            </button>
            {sectionToAddTaskTo?.id === section.id && (
              <TaskQuickForm
                section={section}
                dismiss={() => setSectionToAddTaskTo(undefined)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
