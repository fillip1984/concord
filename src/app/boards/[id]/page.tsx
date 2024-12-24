"use client";

import { useDragAndDrop } from "@formkit/drag-and-drop/react";
import Link from "next/link";
import { use, useEffect } from "react";
import { BsFillFunnelFill } from "react-icons/bs";
import { FaArrowLeft } from "react-icons/fa6";
import BucketCard from "~/app/_components/buckets/BucketCard";
import NewBucketCard from "~/app/_components/buckets/NewBucketCard";
import { api } from "~/trpc/react";
import { type BucketType } from "~/trpc/types";

export default function BoardView({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const boardParams = use(params);
  const { data } = api.bucket.readAll.useQuery(
    {
      boardId: boardParams.id,
    },
    { enabled: !!boardParams.id },
  );

  const utils = api.useUtils();
  const { mutate: reoderBuckets } = api.bucket.reoder.useMutation({
    onSuccess: async () => {
      await utils.bucket.invalidate();
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
    if (data) {
      setBuckets(data);
    }
  }, [data, setBuckets]);

  const handleBucketReorder = () => {
    const updates = buckets.map((b, i) => {
      return { id: b.id, position: i };
    });
    reoderBuckets(updates);
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
            <BucketCard key={bucket.id} bucket={bucket} />
          ))}
        </div>
        {boardParams && buckets && (
          <NewBucketCard
            boardId={boardParams.id}
            bucketCount={buckets.length}
          />
        )}
      </div>
    </div>
  );
}
