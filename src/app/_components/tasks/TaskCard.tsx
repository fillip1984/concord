import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { FaPencil, FaTrash } from "react-icons/fa6";
import { api } from "~/trpc/react";
import { type TaskType } from "~/trpc/types";
import TaskDetailsModal from "./TaskDetailsModal";

export default function TaskView({
  task,
  setTasks,
}: {
  task: TaskType;
  setTasks: Dispatch<SetStateAction<TaskType[]>>;
}) {
  const [taskToEdit, setTaskToEdit] = useState<TaskType | null>(null);
  const utils = api.useUtils();
  const { mutate: updateTask } = api.task.update.useMutation({
    onMutate: async (task) => {
      // optimistically toggle complete of the task
      await utils.bucket.readAll.cancel();
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, complete: !t.complete } : t,
        ),
      );
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
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
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
      <div className="border-1 mx-2 flex items-center rounded border border-gray-500">
        {/* <PiDotsSixVertical className="drag-handle mx-1 cursor-grab" /> */}
        <div className="flex flex-1 items-center justify-between py-2 pr-2">
          <div className="flex flex-col pl-2">
            <div className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={task.complete}
                onChange={handleToggleComplete}
                className="rounded-full"
              />
              <h5
                className={`${task.complete ? "line-through" : ""} cursor-pointer`}
                onClick={handleToggleComplete}>
                {task.text}
              </h5>
            </div>
            <p className="text-sm text-gray-400">{task.description}</p>
          </div>
          <div className="flex gap-1">
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
      </div>

      {taskToEdit && (
        <TaskDetailsModal task={taskToEdit} setTaskToEdit={setTaskToEdit} />
      )}
    </>
  );
}
