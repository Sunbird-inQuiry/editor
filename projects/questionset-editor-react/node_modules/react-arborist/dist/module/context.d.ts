import React from "react";
import { TreeApi } from "./interfaces/tree-api";
export declare const TreeApiContext: React.Context<TreeApi<any> | null>;
export declare function useTreeApi<T>(): TreeApi<T>;
export declare const NodesContext: React.Context<{
    focus: import("./state/focus-slice").FocusState;
    edit: import("./state/edit-slice").EditState;
    open: import("./state/open-slice").OpenSlice;
    selection: import("./state/selection-slice").SelectionState;
    drag: import("./state/drag-slice").DragSlice;
} | null>;
export declare function useNodesContext(): {
    focus: import("./state/focus-slice").FocusState;
    edit: import("./state/edit-slice").EditState;
    open: import("./state/open-slice").OpenSlice;
    selection: import("./state/selection-slice").SelectionState;
    drag: import("./state/drag-slice").DragSlice;
};
export declare const DndContext: React.Context<import("./state/dnd-slice").DndState | null>;
export declare function useDndContext(): import("./state/dnd-slice").DndState;
export declare const DataUpdatesContext: React.Context<number>;
export declare function useDataUpdates(): void;
