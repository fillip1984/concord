import { useDragAndDrop } from "@formkit/drag-and-drop/react";
import { useEffect, useState } from "react";
import { FaPencil, FaPlus, FaTrash } from "react-icons/fa6";
import { PiDotsSix } from "react-icons/pi";
import { api } from "~/trpc/react";
import { type BucketType, type TaskType } from "~/trpc/types";
import TaskCard from "../tasks/TaskCard";
import BucketDetailsModal from "./BucketDetailsModal";

export default function BucketCard({ bucket }: { bucket: BucketType }) {
  const [bucketToEdit, setBucketToEdit] = useState<BucketType | null>(null);

  const utils = api.useUtils();
  const { mutate: deleteBucket } = api.bucket.delete.useMutation({
    onSuccess: async () => {
      await utils.bucket.invalidate();
    },
  });
  const { mutate: createTask } = api.task.create.useMutation({
    onSuccess: async () => {
      await utils.bucket.invalidate();
    },
  });
  // const { mutate: updateTask } = api.task.update.useMutation({
  //   onSuccess: async () => {
  //     await utils.bucket.invalidate();
  //   },
  // });
  const { mutate: reoderTasks } = api.task.reoder.useMutation({
    onSuccess: async () => {
      await utils.bucket.invalidate();
    },
  });
  const handleTaskReorder = (tasksToUpdate: TaskType[]) => {
    const updates = tasksToUpdate.map((t, i) => {
      return { id: t.id, position: i, bucketId: t.bucketId };
    });
    reoderTasks(updates);
  };

  const handleDeleteBucket = () => {
    console.log(`deleting bucket with id ${bucket.id}`);
    deleteBucket({ id: bucket.id });
  };

  const [task, setTask] = useState("");
  const handleAddTask = () => {
    console.log("adding task");
    createTask({
      text: task,
      complete: false,
      position: bucket.tasks.length,
      bucketId: bucket.id,
    });
    setTask("");
  };

  // const handleReset = () => {
  //   tasks.forEach((t) => updateTask({ ...t, complete: false }));
  // };

  // DND
  const [taskListRef, tasks, setTasks] = useDragAndDrop<
    HTMLDivElement,
    TaskType
  >(bucket.tasks, {
    group: "tasks",
    onDragend: (data) => {
      const draggedTask = data.draggedNode.data.value as TaskType;
      const initialParent = draggedTask.bucketId;
      // console.log({ msg: "drag ended", initialParent, newParent });
      const newParent = data.parent.el.dataset.bucketId;
      let tasksToUpdate = data.values as TaskType[];
      if (newParent && newParent !== initialParent) {
        // update bucketId if the task moved buckets
        tasksToUpdate = tasksToUpdate.map((task) =>
          task.id === draggedTask.id ? { ...task, bucketId: newParent } : task,
        );
      }
      handleTaskReorder(tasksToUpdate);
    },
  });
  useEffect(() => {
    setTasks(bucket.tasks);
  }, [bucket, setTasks]);

  return (
    <>
      <div className="flex max-h-full min-w-[350px] flex-1 flex-col overflow-hidden rounded-xl border">
        <div className="p-2">
          <div className="flex justify-center">
            <PiDotsSix className="drag-handle mx-1 cursor-grab" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <h4>{bucket.name}</h4>
              <button type="button" onClick={() => setBucketToEdit(bucket)}>
                <FaPencil className="text-gray-600" />
              </button>
            </div>
            <button type="button" onClick={handleDeleteBucket}>
              <FaTrash className="text-red-400" />
            </button>
          </div>

          <span className="text-sm text-gray-300">{bucket.description}</span>

          <div className="mt-4 flex">
            <input
              type="text"
              value={task}
              placeholder="Add task..."
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={(e) => (e.key === "Enter" ? handleAddTask() : null)}
              className="rounded-r-none"
            />
            <button
              type="button"
              onClick={handleAddTask}
              className="rounded-r-xl bg-orange-500">
              <FaPlus className="mx-2 text-2xl" />
            </button>
          </div>
        </div>

        <div
          data-bucket-id={bucket.id}
          ref={taskListRef}
          className={`my-2 flex h-full min-h-12 flex-col gap-2 overflow-y-auto p-1 ${tasks.length > 0 ? "pb-24" : ""}`}>
          {tasks.length === 0 && (
            <div className="mx-2 flex items-center justify-center rounded bg-stone-800 p-2 text-gray-300">
              No tasks
            </div>
          )}
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} setTasks={setTasks} />
          ))}
        </div>
        {/* <button
          type="button"
          onClick={handleReset}
          className="flex w-full items-center justify-center gap-2 rounded bg-emerald-400 p-1">
          <span className="text-xl">Reset</span>
          <FaRepeat />
        </button> */}
      </div>

      {bucketToEdit && (
        <BucketDetailsModal
          bucket={bucketToEdit}
          setBucketToEdit={setBucketToEdit}
        />
      )}
    </>
  );
}
