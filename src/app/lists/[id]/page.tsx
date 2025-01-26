"use client";

import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import Loading from "~/app/_components/navigation/Loading";
import ListView from "~/app/_components/tasks/ListView";
import { api } from "~/trpc/react";
import { type ListDetailType, type ListSectionType } from "~/trpc/types";

export default function ListPage({ params }: { params: { id: string } }) {
  const { data: list, isLoading } = api.list.readOne.useQuery(
    {
      id: params.id,
    },
    { enabled: !!params.id },
  );

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
    <div className="main-content-container">
      {isLoading && <Loading />}

      {!isLoading && list && (
        <div className="main-content">
          <h4>{list?.name}</h4>

          {listSections && <ListView listSections={listSections} />}

          <AddSection list={list} />
        </div>
      )}
    </div>
  );
}

const AddSection = ({ list }: { list: ListDetailType }) => {
  const [name, setName] = useState("");
  const handleAddSection = (name: string) => {
    console.log("adding section");
    if (list) {
      addSection({ name, listId: list.id, position: 0 });
    }
  };
  const utils = api.useUtils();
  const { mutate: addSection } = api.section.create.useMutation({
    onSuccess: async () => {
      await utils.list.invalidate();
      setName("");
    },
  });
  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name this section..."
      />
      <button
        type="button"
        onClick={() => handleAddSection(name)}
        className="flex items-center gap-2">
        <FaPlus className="text-red-400" />
        <span className="text-gray-300">Add Section</span>
      </button>
    </div>
  );
};
