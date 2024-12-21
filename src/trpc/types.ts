import { type RouterInputs, type RouterOutputs } from "./react";

export type BucketType = RouterOutputs["bucket"]["readAll"][number];
export type BoardSummaryType = RouterOutputs["board"]["readAll"][number];
export type BoardType = RouterOutputs["board"]["readOne"];
export type NewBoardType = RouterInputs["board"]["create"];
export type TaskType = BucketType["tasks"][number];
