"use client";

import { type PriorityOption } from "@prisma/client";
import { type FormEvent, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { api } from "~/trpc/react";
import { type SectionType } from "~/trpc/types";

export default function TaskQuickForm({
  section,
  dismiss,
}: {
  section: SectionType;
  dismiss: () => void;
}) {
  const [text, setText] = useState("");
  const [description, setDescription] = useState("");
  const [complete, setComplete] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<PriorityOption | null>();

  const utils = api.useUtils();
  const { mutate: createTask } = api.task.create.useMutation({
    onSuccess: async () => {
      void utils.list.invalidate();
      setText("");
      setDescription("");
      //   setTaskToEdit(null);
    },
  });

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    createTask({
      text: text,
      description: description,
      position: 0,
      complete: complete,
      sectionId: section.id,
      //   dueDate: parse(dueDate, "yyyy-MM-dd", new Date()),
      //   priority: priority,
    });
  };

  return (
    <div>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Task name..."
      />
      <TextareaAutosize
        minRows={3}
        maxRows={10}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description..."
      />
      <button type="button" onClick={dismiss}>
        Cancel
      </button>
      <button type="button" onClick={handleCreate}>
        Add task
      </button>
    </div>
  );
}
