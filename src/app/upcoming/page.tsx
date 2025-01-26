"use client";

import { format, isBefore, isEqual } from "date-fns";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { type ListSectionType } from "~/trpc/types";
import ListView from "../_components/tasks/ListView";
import Loading from "../_components/navigation/Loading";

export default function Upcoming() {
  const {
    data: tasks,
    isLoading,
    isError,
    refetch: retry,
  } = api.task.upcoming.useQuery();
  const [listSections, setListSections] = useState<ListSectionType[]>();
  // const [overdueSection, setOverdueSection] = useState<ListSectionType>();
  // const [todaySection, setTodaySection] = useState<ListSectionType>();

  useEffect(() => {
    if (tasks) {
      const overdueSection = {
        id: "overdue",
        heading: "Overdue",
        tasks: tasks.filter(
          (task) => task.dueDate && isBefore(task.dueDate, new Date()),
        ),
      };
      const upcomingSection = {
        id: "upcoming",
        heading: format(new Date(), "MMM dd E"),
        tasks: tasks.filter(
          (task) => task.dueDate && isEqual(task.dueDate, new Date()),
        ),
      };
      setListSections([overdueSection, upcomingSection]);
    }
  }, [tasks]);

  return (
    <div className="main-content-container">
      {(isLoading || isError) && (
        <Loading isLoading={isLoading} isError={isError} retry={retry} />
      )}

      {!isLoading && (
        <div className="main-content">
          <h4>Upcoming</h4>
          {listSections && <ListView listSections={listSections} />}
        </div>
      )}
    </div>
  );
}
