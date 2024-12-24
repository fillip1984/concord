import { useState } from "react";
import { api } from "~/trpc/react";

export default function NewBucketCard({
  boardId,
  bucketCount,
}: {
  boardId: string;
  bucketCount: number;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const utils = api.useUtils();
  const { mutate: createBucket } = api.bucket.create.useMutation({
    onSuccess: async () => {
      await utils.bucket.invalidate();
    },
  });

  const handleCreateBucket = () => {
    console.log("Creating bucket");

    createBucket({
      name,
      description,
      position: bucketCount,
      boardId: boardId,
    });
    setName("");
    setDescription("");
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
}
