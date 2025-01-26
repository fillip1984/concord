import { type FormEvent, useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";
import { type ListSectionType } from "~/trpc/types";

export default function TaskCard({
  section,
  dismiss,
}: {
  section: ListSectionType;
  dismiss: () => void;
}) {
  const [text, setText] = useState("");
  const [description, setDescription] = useState("");
  const textRef = useRef<HTMLInputElement>(null);

  const utils = api.useUtils();
  const { mutate: addTask } = api.task.create.useMutation({
    onSuccess: async () => {
      await utils.task.invalidate();
      await utils.list.invalidate();
      setText("");
      setDescription("");
      textRef.current?.focus();
    },
  });
  const handleAddTask = (e: FormEvent) => {
    console.log("adding task");
    e.preventDefault();
    addTask({
      text,
      description,
      complete: false,
      position: section.tasks.length,
      sectionId: section.id,
    });
  };

  useEffect(() => {
    textRef.current?.focus();
  }, [textRef]);

  return (
    <form onSubmit={handleAddTask}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        ref={textRef}
        placeholder="Task..."
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description..."
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={dismiss}
          className="rounded border border-white px-4 py-2">
          Cancel
        </button>
        <button type="submit" className="rounded bg-orange-400 px-4 py-2">
          Add Task
        </button>
      </div>
    </form>
  );
}
