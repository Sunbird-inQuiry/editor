import { ActionTypes } from "../types/utils";
import { actions as dnd } from "./dnd-slice";
export type DragSlice = {
    id: string | null;
    selectedIds: string[];
    destinationParentId: string | null;
    destinationIndex: number | null;
};
export declare function reducer(state: DragSlice | undefined, action: ActionTypes<typeof dnd>): DragSlice;
