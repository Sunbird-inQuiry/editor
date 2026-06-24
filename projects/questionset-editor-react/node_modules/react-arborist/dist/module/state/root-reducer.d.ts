import { ActionFromReducer } from "redux";
export declare const rootReducer: import("redux").Reducer<{
    nodes: {
        focus: import("./focus-slice").FocusState;
        edit: import("./edit-slice").EditState;
        open: import("./open-slice").OpenSlice;
        selection: import("./selection-slice").SelectionState;
        drag: import("./drag-slice").DragSlice;
    };
    dnd: import("./dnd-slice").DndState;
}, {
    type: "FOCUS";
    id: string | null;
} | {
    readonly type: "TREE_BLUR";
} | {
    type: "EDIT";
    id: string | null;
} | import("../types/utils").ActionTypes<{
    open(id: string, filtered: boolean): {
        type: "VISIBILITY_OPEN";
        id: string;
        filtered: boolean;
    };
    close(id: string, filtered: boolean): {
        type: "VISIBILITY_CLOSE";
        id: string;
        filtered: boolean;
    };
    toggle(id: string, filtered: boolean): {
        type: "VISIBILITY_TOGGLE";
        id: string;
        filtered: boolean;
    };
    clear(filtered: boolean): {
        type: "VISIBILITY_CLEAR";
        filtered: boolean;
    };
}> | import("../types/utils").ActionTypes<{
    clear: () => {
        type: "SELECTION_CLEAR";
    };
    only: (id: string | import("../types/utils").IdObj) => {
        type: "SELECTION_ONLY";
        id: string;
    };
    add: (id: string | string[] | import("../types/utils").IdObj | import("../types/utils").IdObj[]) => {
        type: "SELECTION_ADD";
        ids: string[];
    };
    remove: (id: string | string[] | import("../types/utils").IdObj | import("../types/utils").IdObj[]) => {
        type: "SELECTION_REMOVE";
        ids: string[];
    };
    set: (args: {
        ids: Set<string>;
        anchor: string | null;
        mostRecent: string | null;
    }) => {
        ids: Set<string>;
        anchor: string | null;
        mostRecent: string | null;
        type: "SELECTION_SET";
    };
    mostRecent: (id: string | null | import("../types/utils").IdObj) => {
        type: "SELECTION_MOST_RECENT";
        id: string | null;
    };
    anchor: (id: string | null | import("../types/utils").IdObj) => {
        type: "SELECTION_ANCHOR";
        id: string | null;
    };
}> | import("../types/utils").ActionTypes<{
    cursor(cursor: import("../dnd/compute-drop").Cursor): {
        type: "DND_CURSOR";
        cursor: import("../dnd/compute-drop").Cursor;
    };
    dragStart(id: string, dragIds: string[]): {
        type: "DND_DRAG_START";
        id: string;
        dragIds: string[];
    };
    dragEnd(): {
        type: "DND_DRAG_END";
    };
    hovering(parentId: string | null, index: number | null): {
        type: "DND_HOVERING";
        parentId: string | null;
        index: number | null;
    };
}>, Partial<{
    nodes: never;
    dnd: never;
}>>;
export type RootState = ReturnType<typeof rootReducer>;
export type Actions = ActionFromReducer<typeof rootReducer>;
