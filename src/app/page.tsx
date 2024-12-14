"use client";

import { useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { api } from "~/trpc/react";

import { type RouterOutputs } from "~/trpc/react";

type BucketType = RouterOutputs["bucket"]["readAll"][number];
type TaskType = BucketType["tasks"][number];

export default function Home() {
  const { data: buckets } = api.bucket.readAll.useQuery();

  return (
    <div className="flex gap-4 p-2">
      {buckets?.map((bucket) => <Bucket key={bucket.id} bucket={bucket} />)}
      <NewBucket />
    </div>
  );
}

const Bucket = ({ bucket }: { bucket: BucketType }) => {
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
      bucketId: bucket.id,
    });
    setTask("");
  };

  return (
    <div className="w-[350px] rounded-xl border p-2">
      <div className="mb-2 flex items-center justify-between">
        <h4>{bucket.name}</h4>
        <button type="button" onClick={handleDeleteBucket}>
          <FaTrash className="text-red-400" />
        </button>
      </div>

      <div className="flex">
        <input
          type="text"
          value={task}
          placeholder="Add task..."
          onChange={(e) => setTask(e.target.value)}
          className="rounded-r-none"
        />
        <button
          type="button"
          onClick={handleAddTask}
          className="rounded-r-xl bg-orange-400">
          <FaPlus className="mx-2 text-2xl" />
        </button>
      </div>

      <div className="my-2 flex flex-col gap-2">
        {bucket?.tasks.map((task) => <Task key={task.id} task={task} />)}
      </div>
    </div>
  );
};

const Task = ({ task }: { task: TaskType }) => {
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
  return (
    <div className="border-1 rounded border border-gray-500 p-2">
      <div className="flex items-center justify-between">
        <input
          type="checkbox"
          checked={task.complete}
          onClick={handleToggleComplete}
        />
        {task.name}
        <button type="button" onClick={handleDeleteTask}>
          <FaTrash className="text-red-400" />
        </button>
      </div>
    </div>
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
    <div className="flex flex-col gap-2 rounded border p-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
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
