import { type RouterOutputs } from "./react";

export type ListSectionType = {
  heading: string;
  tasks: TaskType[];
};

// export type BoardSummaryType = RouterOutputs["board"]["readAll"][number];
// export type BucketType = RouterOutputs["bucket"]["readAll"][number];
export type ListSummaryType = RouterOutputs["list"]["readAll"][number];
export type ListDetailType = RouterOutputs["list"]["readOne"];
export type SectionType = Extract<
  ListDetailType,
  { sections: unknown }
>["sections"][number];
export type TaskType = Extract<
  SectionType,
  { tasks: unknown }
>["tasks"][number];
export type ChecklistItemType = Extract<
  TaskType,
  { checklistItems: unknown }
>["checklistItems"][number];
export type CommentType = Extract<
  TaskType,
  { comments: unknown }
>["comments"][number];
