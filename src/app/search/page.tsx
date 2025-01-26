"use client";

import { useEffect } from "react";
import { api } from "~/trpc/react";

export default function Upcoming() {
  const { data: tasks } = api.task.upcoming.useQuery();
  // const [listSections, setListSections] = useState<ListSectionType[]>();
  // const [overdueSection, setOverdueSection] = useState<ListSectionType>();
  // const [todaySection, setTodaySection] = useState<ListSectionType>();

  useEffect(() => {
    // if (tasks) {
    //   const overdueSection = {
    //     id: "overdue",
    //     heading: "Overdue",
    //     tasks: tasks.filter(
    //       (task) => task.dueDate && isBefore(task.dueDate, new Date()),
    //     ),
    //   };
    //   const upcomingSection = {
    //     id: "upcoming",
    //     heading: format(new Date(), "MMM dd E"),
    //     tasks: tasks.filter(
    //       (task) => task.dueDate && isEqual(task.dueDate, new Date()),
    //     ),
    //   };
    //   setListSections([overdueSection, upcomingSection]);
    // }
  }, [tasks]);

  return (
    <div className="main-content-container">
      {/* {isLoading && <Loading />} */}

      {/* {!isLoading && ( */}
      <div className="main-content">
        <h4>Search</h4>
        <input type="search" />
        {/* {listSections && <ListView listSections={listSections} />} */}
      </div>
      {/* )} */}
    </div>
  );
}
