import { ActionTypes, IdObj } from "../types/utils";
export type SelectionState = {
    ids: Set<string>;
    anchor: string | null;
    mostRecent: string | null;
};
export declare const actions: {
    clear: () => {
        type: "SELECTION_CLEAR";
    };
    only: (id: string | IdObj) => {
        type: "SELECTION_ONLY";
        id: string;
    };
    add: (id: string | string[] | IdObj | IdObj[]) => {
        type: "SELECTION_ADD";
        ids: string[];
    };
    remove: (id: string | string[] | IdObj | IdObj[]) => {
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
    mostRecent: (id: string | null | IdObj) => {
        type: "SELECTION_MOST_RECENT";
        id: string | null;
    };
    anchor: (id: string | null | IdObj) => {
        type: "SELECTION_ANCHOR";
        id: string | null;
    };
};
export declare function reducer(state: SelectionState | undefined, action: ActionTypes<typeof actions>): SelectionState;
