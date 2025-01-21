"use client";

import { useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
import TaskQuickForm from "junk/TaskQuickForm";
import { api } from "~/trpc/react";
import { type SectionType } from "~/trpc/types";

export default function ListView({ params }: { params: { id: string } }) {
  const { data: list } = api.list.readOne.useQuery(
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

  return (
    <div className="flex w-screen flex-1 justify-center">
      <div className="flex flex-col gap-8 overflow-hidden bg-yellow-400">
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
    </div>
  );
}
