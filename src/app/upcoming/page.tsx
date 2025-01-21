"use client";

import { format, isBefore, isEqual } from "date-fns";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { type ListSectionType } from "~/trpc/types";
import ListView from "../_components/tasks/ListView";

export default function Upcoming() {
  const { data: tasks, isLoading } = api.task.readAll.useQuery();
  const [listSections, setListSections] = useState<ListSectionType[]>();
  // const [overdueSection, setOverdueSection] = useState<ListSectionType>();
  // const [todaySection, setTodaySection] = useState<ListSectionType>();

  useEffect(() => {
    if (tasks) {
      const overdueSection = {
        heading: "Overdue",
        tasks: tasks.filter(
          (task) => task.dueDate && isBefore(task.dueDate, new Date()),
        ),
      };
      const todaySection = {
        heading: format(new Date(), "MMM dd E"),
        tasks: tasks.filter(
          (task) => task.dueDate && isEqual(task.dueDate, new Date()),
        ),
      };
      setListSections([overdueSection, todaySection]);
    }
  }, [tasks]);

  return (
    <div>
      {isLoading && <span>Loading...</span>}

      {!isLoading && (
        <div>
          <h4>Upcoming</h4>
          {listSections && <ListView listSections={listSections} />}
        </div>
      )}
    </div>
  );
}
