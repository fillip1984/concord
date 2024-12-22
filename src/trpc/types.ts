import { type RouterInputs, type RouterOutputs } from "./react";

export type BoardSummaryType = RouterOutputs["board"]["readAll"][number];
// export type NewBoardType = RouterInputs["board"]["create"];
export type BoardType = RouterOutputs["board"]["readOne"];
export type BucketType = RouterOutputs["bucket"]["readAll"][number];
export type TaskType = Extract<BucketType, { tasks: unknown }>["tasks"][number];
export type ChecklistItemType = Extract<
  TaskType,
  { checklistItems: unknown }
>["checklistItems"][number];
