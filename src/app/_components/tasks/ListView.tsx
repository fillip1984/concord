import { useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { type ListSectionType } from "~/trpc/types";

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

  return (
    <div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => console.log("testing")}>
          <FaChevronDown />
        </button>
        <span>{section.heading}</span>
      </div>
      {!isCollapsed && (
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
      )}
    </div>
  );
};
