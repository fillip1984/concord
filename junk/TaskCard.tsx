import { format, isPast } from "date-fns";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import {
  BsCalendar4Event,
  BsChatSquareText,
  BsFlag,
  BsListTask,
} from "react-icons/bs";
import { FaPencil, FaTrash } from "react-icons/fa6";
import { api } from "~/trpc/react";
import { type TaskType } from "~/trpc/types";
// import TaskDetailsModal from "../tasks/TaskDetailsModal";

export default function TaskView({
  task,
  // setTasks,
}: {
  task: TaskType;
  // setTasks: Dispatch<SetStateAction<TaskType[]>>;
}) {
  const [taskToEdit, setTaskToEdit] = useState<TaskType | null>(null);
  const utils = api.useUtils();
  const { mutate: updateTask } = api.task.update.useMutation({
    onMutate: async (task) => {
      // optimistically toggle complete of the task
      await utils.bucket.readAll.cancel();
      // setTasks((prev) =>
      //   prev.map((t) =>
      //     t.id === task.id ? { ...t, complete: !t.complete } : t,
      //   ),
      // );
    },
    // TODO: skipped implementing rollback of optimistic update..., see: https://tanstack.com/query/v4/docs/framework/react/guides/optimistic-updates
    onSuccess: async () => {
      await utils.bucket.invalidate();
    },
  });
  const { mutate: deleteTask } = api.task.delete.useMutation({
    onMutate: async (task) => {
      // optimistically delete the task
      await utils.bucket.readAll.cancel();
      // setTasks((prev) => prev.filter((t) => t.id !== task.id));
      // return { prevState };
    },
    // TODO: skipped implementing rollback of optimistic update..., see: https://tanstack.com/query/v4/docs/framework/react/guides/optimistic-updates
    // onError: (err, task, context) => {
    //   if (context?.prevState) {
    //     setTasks((prev) => [...prev, context?.prevState]);
    //   }
    // },
    onSuccess: async () => {
      await utils.bucket.invalidate();
    },
  });
  const handleDeleteTask = () => {
    console.log("deleting task");
    deleteTask({ id: task.id });
  };
  const handleToggleComplete = () => {
    console.log("toggling complete");
    updateTask({
      id: task.id,
      text: task.text,
      description: task.description ?? "",
      complete: !task.complete,
      position: task.position,
      dueDate: task.dueDate,
      priority: task.priority,
    });
  };
  const handleTaskEdit = () => {
    console.log("editing task");
    setTaskToEdit(task);
  };

  useEffect(() => {
    if (setTaskToEdit !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [setTaskToEdit]);

  return (
    <>
      <div className="border-1 mx-2 flex flex-col rounded border border-gray-500">
        <div className="flex items-center gap-1 p-2">
          <input
            type="checkbox"
            checked={task.complete}
            onChange={handleToggleComplete}
            className="rounded-full"
          />
          <div>
            <h5
              className={`${task.complete ? "line-through" : ""} cursor-pointer`}
              onClick={handleToggleComplete}>
              {task.text}
            </h5>
            <p className="text-sm text-gray-400">{task.description}</p>
          </div>
        </div>

        <div className="flex gap-2 px-2">
          {task.priority && (
            <div className="flex items-center gap-2 rounded bg-stone-800 p-1">
              <BsFlag />
              <span className="text-xs">{task.priority}</span>
            </div>
          )}

          {task.dueDate && (
            <div
              className={`flex items-center gap-2 rounded ${isPast(task.dueDate) ? "bg-red-400" : "bg-stone-800"} p-1`}>
              <BsCalendar4Event />
              <span className="text-xs">
                {format(task.dueDate, "yyyy-MM-dd")}
              </span>
            </div>
          )}

          {/* {task.checklistItems.length > 0 && (
            <div className="flex items-center gap-2 rounded bg-stone-800 p-1">
              <BsListTask className="text-xl" />
              <span className="text-xs">
                {task.checklistItems.filter((t) => t.complete).length}/
                {task.checklistItems.length}
              </span>
            </div>
          )}

          {task.comments.length > 0 && (
            <div className="flex items-center gap-2 rounded bg-stone-800 p-1">
              <BsChatSquareText className="text-xl" />
              <span className="text-xs">{task.comments.length}</span>
            </div>
          )} */}
        </div>

        <div className="flex justify-end gap-1 p-2">
          <button
            type="button"
            onClick={handleTaskEdit}
            className="text-emerald-300">
            <FaPencil />
          </button>
          <button type="button" onClick={handleDeleteTask}>
            <FaTrash className="text-red-400" />
          </button>
        </div>
      </div>
      {/* {taskToEdit && ( */}
      {/* // <TaskDetailsModal task={taskToEdit} setTaskToEdit={setTaskToEdit} /> */}
      {/* )} */}
    </>
  );
}
