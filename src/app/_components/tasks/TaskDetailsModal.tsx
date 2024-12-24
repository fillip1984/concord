import { PriorityOption } from "@prisma/client";
import { format, formatDate, parse } from "date-fns";
import {
  useEffect,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import {
  BsCalendar4Event,
  BsChatSquareText,
  BsFlag,
  BsListTask,
  BsPlus,
  BsTextLeft,
  BsTrash,
} from "react-icons/bs";
import { IoIosClose } from "react-icons/io";
import TextareaAutosize from "react-textarea-autosize";
import { useDebounceValue } from "usehooks-ts";
import { api } from "~/trpc/react";
import {
  type ChecklistItemType,
  type CommentType,
  type TaskType,
} from "~/trpc/types";

export default function TaskDetailsModal({
  task,
  setTaskToEdit,
}: {
  task: TaskType;
  setTaskToEdit: Dispatch<SetStateAction<TaskType | null>>;
}) {
  const [text, setText] = useState("");
  const [description, setDescription] = useState("");
  const [complete, setComplete] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<PriorityOption | null>();

  useEffect(() => {
    setText(task.text);
    setDescription(task.description ?? "");
    setComplete(task.complete);
    setDueDate(task.dueDate ? format(task.dueDate, "yyyy-MM-dd") : "");
    setPriority(task.priority ? task.priority : null);
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
      text: text,
      description: description,
      position: task.position,
      complete: complete,
      dueDate: parse(dueDate, "yyyy-MM-dd", new Date()),
      priority: priority,
    });
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={() => setTaskToEdit(null)}
        className="absolute inset-0 z-[999] bg-gray-500/10 backdrop-blur-sm"></div>

      {/* Modal content */}
      <div className="z-[1000] h-5/6 w-4/5 overflow-hidden rounded-lg bg-stone-700">
        <div className="flex items-center justify-end p-2">
          <button type="button" onClick={() => setTaskToEdit(null)}>
            <IoIosClose className="text-4xl" />
          </button>
        </div>

        <form
          onSubmit={handleSave}
          className="flex h-full flex-col gap-2 overflow-y-auto p-4 pb-24">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <input
                type="checkbox"
                className="h-6 w-6 rounded-full"
                checked={complete}
                onChange={() => setComplete(!complete)}
              />
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            <div className="flex gap-1">
              <BsTextLeft className="w-6 text-2xl" />
              <TextareaAutosize
                minRows={3}
                maxRows={10}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1">
              <BsCalendar4Event className="w-6 text-2xl" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1">
              <BsFlag className="w-6 text-2xl" />
              <select
                value={priority ?? ""}
                onChange={(e) => setPriority(e.target.value as PriorityOption)}>
                <option></option>
                <option value={PriorityOption.LOWEST}>Lowest</option>
                <option value={PriorityOption.LOW}>Low</option>
                <option value={PriorityOption.MEDIUM}>Medium</option>
                <option value={PriorityOption.HIGH}>High</option>
                <option value={PriorityOption.HIGHEST}>Highest</option>
                <option value={PriorityOption.URGENT}>Urgent</option>
                <option value={PriorityOption.IMPORTANT}>Important</option>
                <option value={PriorityOption.URGENT_AND_IMPORTANT}>
                  Urgent and Important
                </option>
              </select>
            </div>
            <div>
              <button
                type="submit"
                className="rounded bg-orange-400 px-4 py-2 text-2xl">
                Save
              </button>
            </div>

            <hr className="my-2" />
            <ChecklistView taskId={task.id} />

            <hr className="my-2" />
            <CommentView taskId={task.id} />
          </div>
        </form>
      </div>
    </div>
  );
}

const ChecklistView = ({ taskId }: { taskId: string }) => {
  const [newChecklistItem, setNewChecklistItem] = useState("");

  const utils = api.useUtils();
  const { data: task } = api.task.readOne.useQuery({ id: taskId });
  const { mutate: createChecklistItem } = api.checklistItem.create.useMutation({
    onSuccess: async () => {
      void utils.task.readOne.invalidate({ id: taskId });
    },
  });

  const handleAddChecklistItem = () => {
    createChecklistItem({
      text: newChecklistItem,
      position: task?.checklistItems.length ?? 0,
      complete: false,
      taskId,
    });
    setNewChecklistItem("");
  };

  return (
    <div className="flex w-full flex-col">
      <div className="flex items-center gap-1">
        <BsListTask className="w-6 text-2xl" />
        Checklist ({task?.checklistItems.filter((li) => li.complete).length}/
        {task?.checklistItems?.length})
      </div>
      <div className="flex flex-col gap-2">
        {task?.checklistItems.map((checklistItem) => (
          <ChecklistItemRow
            key={checklistItem.id}
            checklistItem={checklistItem}
          />
        ))}
      </div>
      <div className="mt-4 flex w-full">
        <input
          type="text"
          value={newChecklistItem}
          onChange={(e) => setNewChecklistItem(e.target.value)}
          placeholder="Add checklist item..."
          className="rounded-r-none"
        />
        <button
          onClick={handleAddChecklistItem}
          type="button"
          className="rounded-r bg-orange-400">
          <BsPlus className="text-2xl" />
        </button>
      </div>
    </div>
  );
};

const ChecklistItemRow = ({
  checklistItem,
}: {
  checklistItem: ChecklistItemType;
}) => {
  const [debouncedText, setDebouncedText] = useDebounceValue(
    checklistItem.text,
    500,
  );
  useEffect(() => {
    handleChecklistItemText();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedText]);
  const utils = api.useUtils();
  const { mutate: updateChecklistItem } = api.checklistItem.update.useMutation({
    onSuccess: async () => {
      void utils.task.readOne.invalidate({ id: checklistItem.taskId });
    },
  });
  const { mutate: deleteChecklistItem } = api.checklistItem.delete.useMutation({
    onSuccess: async () => {
      void utils.task.readOne.invalidate({ id: checklistItem.taskId });
    },
  });
  const handleChecklistItemText = () => {
    updateChecklistItem({
      id: checklistItem.id,
      complete: checklistItem.complete,
      text: debouncedText,
      position: checklistItem.position,
    });
  };
  const handleChecklistItemComplete = () => {
    updateChecklistItem({
      id: checklistItem.id,
      complete: !checklistItem.complete,
      text: checklistItem.text,
      position: checklistItem.position,
    });
  };
  const handleChecklistItemDelete = () => {
    deleteChecklistItem({ id: checklistItem.id });
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={checklistItem.complete}
        onChange={handleChecklistItemComplete}
        className="rounded"
      />
      <input
        type="text"
        defaultValue={checklistItem.text}
        onChange={(e) => setDebouncedText(e.target.value)}
      />
      <button type="button" onClick={handleChecklistItemDelete}>
        <BsTrash className="text-2xl text-red-400" />
      </button>
    </div>
  );
};

const CommentView = ({ taskId }: { taskId: string }) => {
  const [newComment, setNewComment] = useState("");

  const utils = api.useUtils();
  const { data: task } = api.task.readOne.useQuery({ id: taskId });
  const { mutate: createComment } = api.comment.create.useMutation({
    onSuccess: async () => {
      void utils.task.readOne.invalidate({ id: taskId });
    },
  });

  const handleAddComment = () => {
    createComment({
      text: newComment,
      posted: new Date(),
      taskId,
    });
    setNewComment("");
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1">
        <BsChatSquareText className="w-6 text-2xl" />
        Comments {task?.comments.length ?? 0}
      </div>
      <div className="flex flex-col gap-4">
        {task?.comments.map((comment) => (
          <CommentRow key={comment.id} comment={comment} />
        ))}
      </div>
      <div className="mt-4 flex flex-col">
        <TextareaAutosize
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          minRows={3}
          maxRows={5}
          placeholder="Comments..."
          className="resize-none rounded-b-none"
        />
        <button
          onClick={handleAddComment}
          type="button"
          className="flex items-center justify-center rounded rounded-t-none bg-orange-400 px-4 py-2">
          <BsPlus className="rounded text-4xl" />
        </button>
      </div>
    </div>
  );
};

const CommentRow = ({ comment }: { comment: CommentType }) => {
  // const [debouncedText, setDebouncedText] = useDebounceValue(comment.text, 500);
  // useEffect(() => {
  //   handleChecklistItemText();
  // }, [debouncedText]);
  // const utils = api.useUtils();
  // const { mutate: updateChecklistItem } = api.checklistItem.update.useMutation({
  // onSuccess: async () => {
  // void utils.task.readOne.invalidate({ id: checklistItem.taskId });
  // },
  // });
  // const { mutate: deleteChecklistItem } = api.checklistItem.delete.useMutation({
  //   onSuccess: async () => {
  //     void utils.task.readOne.invalidate({ id: checklistItem.taskId });
  //   },
  // });
  // const handleChecklistItemText = () => {
  //   updateChecklistItem({
  //     id: checklistItem.id,
  //     complete: checklistItem.complete,
  //     text: debouncedText,
  //     position: checklistItem.position,
  //   });
  // };
  // const handleChecklistItemComplete = () => {
  //   updateChecklistItem({
  //     id: checklistItem.id,
  //     complete: !checklistItem.complete,
  //     text: checklistItem.text,
  //     position: checklistItem.position,
  //   });
  // };
  // const handleChecklistItemDelete = () => {
  //   deleteChecklistItem({ id: checklistItem.id });
  // };

  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-300">
        Posted: {formatDate(comment.posted, "yyyy-MM-dd hh:mm:ss")}
      </span>
      <span>{comment.text}</span>
    </div>
  );
};
