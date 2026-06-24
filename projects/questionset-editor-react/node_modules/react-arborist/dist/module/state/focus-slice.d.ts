export type FocusState = {
    id: string | null;
    treeFocused: boolean;
};
export declare function focus(id: string | null): {
    type: "FOCUS";
    id: string | null;
};
export declare function treeBlur(): {
    readonly type: "TREE_BLUR";
};
export declare function reducer(state: FocusState | undefined, action: ReturnType<typeof focus> | ReturnType<typeof treeBlur>): FocusState;
