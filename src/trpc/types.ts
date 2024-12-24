import { type RouterOutputs } from "./react";

export type BoardSummaryType = RouterOutputs["board"]["readAll"][number];
export type BucketType = RouterOutputs["bucket"]["readAll"][number];
export type TaskType = Extract<BucketType, { tasks: unknown }>["tasks"][number];
export type ChecklistItemType = Extract<
  TaskType,
  { checklistItems: unknown }
>["checklistItems"][number];
export type CommentType = Extract<
  TaskType,
  { comments: unknown }
>["comments"][number];
