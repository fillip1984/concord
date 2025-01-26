"use client";

import { format, isBefore, isEqual } from "date-fns";
import React, { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { type ListSectionType } from "~/trpc/types";
import ListView from "../_components/tasks/ListView";

export default function Today() {
  const { data: tasks, isLoading } = api.task.today.useQuery();
  const [listSections, setListSections] = useState<ListSectionType[]>();
  // const [overdueSection, setOverdueSection] = useState<ListSectionType>();
  // const [todaySection, setTodaySection] = useState<ListSectionType>();

  const [taskCount, setTaskCount] = useState(0);
  useEffect(() => {
    if (listSections) {
      setTaskCount(
        listSections.reduce(
          (count, listSection) => (count += listSection.tasks.length),
          0,
        ),
      );
    }
  }, [listSections]);

  useEffect(() => {
    if (tasks) {
      const overdueSection = {
        id: "overdue",
        heading: "Overdue",
        tasks: tasks.filter(
          (task) => task.dueDate && isBefore(task.dueDate, new Date()),
        ),
      };
      const todaySection = {
        id: "today",
        heading: format(new Date(), "MMM dd E"),
        tasks: tasks.filter(
          (task) => task.dueDate && isEqual(task.dueDate, new Date()),
        ),
      };
      setListSections([overdueSection, todaySection]);
    }
  }, [tasks]);

  return (
    <div className="flex justify-center pt-8">
      {isLoading && <span>Loading...</span>}
      {!isLoading && (
        <div className="flex min-w-[600px] flex-col gap-6">
          <h4>Today</h4>
          <span>{taskCount} tasks</span>
          <div>{listSections && <ListView listSections={listSections} />}</div>
        </div>
      )}
    </div>
  );
}
