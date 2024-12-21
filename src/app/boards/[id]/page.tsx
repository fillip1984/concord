"use client";

import { useDragAndDrop } from "@formkit/drag-and-drop/react";
import Link from "next/link";
import {
  type Dispatch,
  type FormEvent,
  type SetStateAction,
  use,
  useEffect,
  useState,
} from "react";
import { BsFillFunnelFill } from "react-icons/bs";
import { FaPlus, FaTrash } from "react-icons/fa";
import { FaArrowLeft, FaPencil } from "react-icons/fa6";
import { IoIosClose } from "react-icons/io";
import { PiDotsSix, PiDotsSixVertical } from "react-icons/pi";
import { api } from "~/trpc/react";
import { type BoardType, type BucketType, type TaskType } from "~/trpc/types";

export default function BoardView({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const boardParams = use(params);

  const { data: board } = api.board.readOne.useQuery({
    id: boardParams.id,
  });
  const utils = api.useUtils();
  const { mutate: reoderBuckets } = api.bucket.reoder.useMutation({
    onSuccess: async () => {
      await utils.board.invalidate();
    },
  });
  const { mutate: reoderTasks } = api.task.reoder.useMutation({
    onSuccess: async () => {
      await utils.board.invalidate();
    },
  });

  // DND
  const [bucketListRef, buckets, setBuckets] = useDragAndDrop<
    HTMLDivElement,
    BucketType
  >([], {
    group: "buckets",
    dragHandle: ".drag-handle",
    onDragend: () => {
      handleBucketReorder();
    },
  });
  useEffect(() => {
    if (board && board.buckets) {
      setBuckets(board.buckets);
    }
  }, [board, setBuckets]);

  const handleBucketReorder = () => {
    const updates = buckets.map((b, i) => {
      return { id: b.id, position: i };
    });
    console.log({ updates });
    reoderBuckets(updates);
  };

  const handleTaskReorder = (tasksToUpdate: TaskType[]) => {
    const updates = tasksToUpdate.map((t, i) => {
      return { id: t.id, position: i, bucketId: t.bucketId };
    });
    reoderTasks(updates);
  };

  return (
    <div className="flex flex-1 flex-col gap-8 overflow-hidden">
      {/* menu across the top */}
      <div className="fixed w-full p-2">
        <div className="flex justify-between">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded bg-stone-500 px-4 py-2">
            <FaArrowLeft className="text-2xl" />
            Back
          </Link>
          <input type="text" placeholder="Search..." className="w-1/2" />
          <button type="button" className="rounded bg-emerald-400 p-2">
            <BsFillFunnelFill />
          </button>
        </div>
      </div>

      <div className="mt-16 flex flex-1 gap-8 overflow-x-auto overflow-y-hidden p-4">
        <div ref={bucketListRef} className="flex flex-1 items-start gap-4">
          {buckets.map((bucket) => (
            <Bucket
              key={bucket.id}
              bucket={bucket}
              handleTaskReorder={handleTaskReorder}
            />
          ))}
        </div>
        {board && <NewBucket board={board} />}
      </div>
    </div>
  );
}

const Bucket = ({
  bucket,
  handleTaskReorder,
}: {
  bucket: BucketType;
  handleTaskReorder: (tasksToUpdate: TaskType[]) => void;
}) => {
  const [bucketToEdit, setBucketToEdit] = useState<BucketType | null>(null);

  const utils = api.useUtils();
  const { mutate: deleteBucket } = api.bucket.delete.useMutation({
    onSuccess: async () => {
      await utils.board.invalidate();
    },
  });
  const { mutate: createTask } = api.task.create.useMutation({
    onSuccess: async () => {
      await utils.board.invalidate();
    },
  });
  // const { mutate: updateTask } = api.task.update.useMutation({
  //   onSuccess: async () => {
  //     await utils.board.invalidate();
  //   },
  // });

  const handleDeleteBucket = () => {
    console.log(`deleting bucket with id ${bucket.id}`);
    deleteBucket({ id: bucket.id });
  };

  const [task, setTask] = useState("");
  const handleAddTask = () => {
    console.log("adding task");
    createTask({
      text: task,
      description: "TBD",
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
    dragHandle: ".drag-handle",
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
              className="rounded-r-xl">
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
            <TaskView key={task.id} task={task} setTasks={setTasks} />
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
};

const TaskView = ({
  task,
  setTasks,
}: {
  task: TaskType;
  setTasks: Dispatch<SetStateAction<TaskType[]>>;
}) => {
  const [taskToEdit, setTaskToEdit] = useState<TaskType | null>(null);
  const utils = api.useUtils();
  const { mutate: updateTask } = api.task.update.useMutation({
    onMutate: async (task) => {
      // optimistically toggle complete of the task
      await utils.board.readOne.cancel();
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, complete: !t.complete } : t,
        ),
      );
    },
    // TODO: skipped implementing rollback of optimistic update..., see: https://tanstack.com/query/v4/docs/framework/react/guides/optimistic-updates
    onSuccess: async () => {
      await utils.board.invalidate();
    },
  });
  const { mutate: deleteTask } = api.task.delete.useMutation({
    onMutate: async (task) => {
      // optimistically delete the task
      await utils.board.readOne.cancel();
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
      await utils.board.invalidate();
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
      position: task.position,
      complete: !task.complete,
    });
  };
  const handleTaskEdit = () => {
    console.log("editing task");
    setTaskToEdit(task);
  };

  return (
    <>
      <div className="border-1 mx-2 flex items-center rounded border border-gray-500">
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
              {task.text}
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

const NewBucket = ({ board }: { board: BoardType }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const utils = api.useUtils();
  const { mutate: createBucket } = api.bucket.create.useMutation({
    onSuccess: async () => {
      await utils.board.invalidate();
    },
  });

  const handleCreateBucket = () => {
    console.log("Creating bucket");
    if (board) {
      createBucket({
        name,
        description,
        position: board.buckets.length ?? 0,
        boardId: board.id,
      });
      setName("");
      setDescription("");
    }
  };

  return (
    <div className="flex h-fit min-w-[350px] flex-1 flex-col justify-start gap-2 rounded-xl border p-2 pb-12">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New bucket name..."
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="New bucket description..."
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
  const [text, setText] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setText(task.text);
    setDescription(task.description ?? "");
  }, [task]);

  const utils = api.useUtils();
  const { mutate: updateTask } = api.task.update.useMutation({
    onSuccess: async () => {
      void utils.board.invalidate();
      setTaskToEdit(null);
    },
  });

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    updateTask({
      id: task.id,
      text,
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
          <span>{task.text}</span>
          <button type="button" onClick={() => setTaskToEdit(null)}>
            <IoIosClose className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-2 p-4">
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
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
    setDescription(bucket.description ?? "");
  }, [bucket]);

  const utils = api.useUtils();
  const { mutate: updateBucket } = api.bucket.update.useMutation({
    onSuccess: async () => {
      void utils.board.invalidate();
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
