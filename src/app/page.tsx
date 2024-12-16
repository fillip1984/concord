"use client";

import { useDragAndDrop } from "@formkit/drag-and-drop/react";
import {
  type Dispatch,
  type FormEvent,
  type SetStateAction,
  useEffect,
  useState,
} from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { FaPencil, FaRepeat } from "react-icons/fa6";
import { IoIosClose } from "react-icons/io";
import { PiDotsSix, PiDotsSixVertical } from "react-icons/pi";
import { api, type RouterOutputs } from "~/trpc/react";

type BucketType = RouterOutputs["bucket"]["readAll"][number];
type TaskType = BucketType["tasks"][number];

export default function Home() {
  const { data } = api.bucket.readAll.useQuery();
  // DND
  const [bucketListRef, buckets, setBuckets] = useDragAndDrop<
    HTMLDivElement,
    BucketType
  >(data ?? [], { group: "buckets", dragHandle: ".drag-handle" });

  useEffect(() => {
    if (data) {
      setBuckets(data);
    }
  }, [data, setBuckets]);

  return (
    <div ref={bucketListRef} className="flex gap-4 overflow-x-auto p-2">
      {buckets.map((bucket) => (
        <Bucket key={bucket.id} bucket={bucket} />
      ))}
      <NewBucket />
    </div>
  );
}

const Bucket = ({ bucket }: { bucket: BucketType }) => {
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
  const { mutate: updateTask } = api.task.update.useMutation({
    onSuccess: async () => {
      await utils.bucket.invalidate();
    },
  });
  const { mutate: reoderTasks } = api.task.reoder.useMutation({
    onSuccess: async () => {
      await utils.bucket.invalidate();
    },
  });
  const handleDeleteBucket = () => {
    console.log(`deleting bucket with id ${bucket.id}`);
    deleteBucket({ id: bucket.id });
  };

  const [task, setTask] = useState("");
  const handleAddTask = () => {
    console.log("adding task");
    createTask({
      name: task,
      description: "TBD",
      complete: false,
      position: bucket.tasks.length,
      bucketId: bucket.id,
    });
    setTask("");
  };

  // DND
  const [taskListRef, tasks, setTasks] = useDragAndDrop<
    HTMLDivElement,
    TaskType
  >(bucket.tasks, {
    group: bucket.id,
    dragHandle: ".drag-handle",
    onDragend() {
      handleReorder();
    },
  });
  useEffect(() => {
    setTasks(bucket.tasks);
  }, [bucket, setTasks]);

  const handleReorder = () => {
    const updates = tasks.map((t, i) => {
      return { id: t.id, position: i };
    });
    console.log({ updates });
    reoderTasks(updates);
  };

  const handleReset = () => {
    tasks.forEach((t) => updateTask({ ...t, complete: false }));
  };

  return (
    <>
      <div className="min-w-[350px] rounded-xl border p-2">
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
            className="rounded-r-xl bg-orange-400">
            <FaPlus className="mx-2 text-2xl" />
          </button>
        </div>

        <div ref={taskListRef} className="my-2 flex flex-col gap-2">
          {tasks.map((task) => (
            <Task key={task.id} task={task} />
          ))}
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="flex w-full items-center justify-center gap-2 rounded bg-emerald-400 p-1">
          <span className="text-xl">Reset</span>
          <FaRepeat />
        </button>
      </div>

      {bucketToEdit && (
        <BucketDetailsModal
          bucket={bucketToEdit}
          setBucketToEdit={setBucketToEdit}
        />
      )}
    </>
  );
};

const Task = ({ task }: { task: TaskType }) => {
  const [taskToEdit, setTaskToEdit] = useState<TaskType | null>(null);
  const utils = api.useUtils();
  const { mutate: updateTask } = api.task.update.useMutation({
    onSuccess: async () => {
      await utils.bucket.invalidate();
    },
  });
  const { mutate: deleteTask } = api.task.delete.useMutation({
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
      name: task.name,
      description: task.description,
      position: 0,
      complete: !task.complete,
    });
  };
  const handleTaskEdit = () => {
    console.log("editing task");
    setTaskToEdit(task);
  };

  return (
    <>
      <div className="border-1 flex items-center rounded border border-gray-500">
        <PiDotsSixVertical className="drag-handle mx-1 cursor-grab" />
        <div className="flex flex-1 items-center justify-between py-2 pr-2">
          <div className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={task.complete}
              onChange={handleToggleComplete}
            />
            <span
              className={`${task.complete ? "line-through" : ""} cursor-pointer`}
              onClick={handleToggleComplete}>
              {task.name}
            </span>
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
};

const NewBucket = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const utils = api.useUtils();
  const { mutate: createBucket } = api.bucket.create.useMutation({
    onSuccess: async () => {
      await utils.bucket.invalidate();
    },
  });

  const handleCreateBucket = () => {
    console.log("Createing bucket");
    createBucket({ name, description, position: 0 });
    setName("");
    setDescription("");
  };

  return (
    <div className="flex min-w-[350px] flex-col gap-2 rounded border p-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name..."
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description..."
      />
      <button
        type="button"
        onClick={handleCreateBucket}
        className="rounded bg-orange-500 px-4 py-2 text-2xl">
        Add
      </button>
    </div>
  );
};

const TaskDetailsModal = ({
  task,
  setTaskToEdit,
}: {
  task: TaskType;
  setTaskToEdit: Dispatch<SetStateAction<TaskType | null>>;
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setName(task.name);
    setDescription(task.description);
  }, [task]);

  const utils = api.useUtils();
  const { mutate: updateTask } = api.task.update.useMutation({
    onSuccess: async () => {
      void utils.bucket.invalidate();
      setTaskToEdit(null);
    },
  });

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    updateTask({
      id: task.id,
      name,
      description,
      complete: task.complete,
      position: task.position,
    });
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={() => setTaskToEdit(null)}
        className="absolute inset-0 z-[999] bg-gray-500/10 backdrop-blur-sm"></div>

      {/* Modal content */}
      <div className="z-[1000] min-h-[400px] w-1/2 bg-stone-700">
        <div className="flex items-center justify-between p-2">
          <span>{task.name}</span>
          <button type="button" onClick={() => setTaskToEdit(null)}>
            <IoIosClose className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-2 p-4">
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              className="rounded bg-orange-400 px-4 py-2 text-2xl">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BucketDetailsModal = ({
  bucket,
  setBucketToEdit,
}: {
  bucket: BucketType;
  setBucketToEdit: Dispatch<SetStateAction<BucketType | null>>;
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setName(bucket.name);
    setDescription(bucket.description);
  }, [bucket]);

  const utils = api.useUtils();
  const { mutate: updateBucket } = api.bucket.update.useMutation({
    onSuccess: async () => {
      void utils.bucket.invalidate();
      setBucketToEdit(null);
    },
  });

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    updateBucket({
      id: bucket.id,
      name,
      description,
      position: bucket.position,
    });
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={() => setBucketToEdit(null)}
        className="absolute inset-0 z-[999] bg-gray-500/10 backdrop-blur-sm"></div>

      {/* Modal content */}
      <div className="z-[1000] min-h-[400px] w-1/2 bg-stone-700">
        <div className="flex items-center justify-between p-2">
          <span>{bucket.name}</span>
          <button type="button" onClick={() => setBucketToEdit(null)}>
            <IoIosClose className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-2 p-4">
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              className="rounded bg-orange-400 px-4 py-2 text-2xl">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
