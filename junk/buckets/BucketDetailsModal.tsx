import {
  useEffect,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import { IoIosClose } from "react-icons/io";
import { api } from "~/trpc/react";
import { type BucketType } from "~/trpc/types";

export default function BucketDetailsModal({
  bucket,
  setBucketToEdit,
}: {
  bucket: BucketType;
  setBucketToEdit: Dispatch<SetStateAction<BucketType | null>>;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setName(bucket.name);
    setDescription(bucket.description ?? "");
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
}
