import { ActionTypes } from "../types/utils";
export type OpenMap = {
    [id: string]: boolean;
};
export type OpenSlice = {
    unfiltered: OpenMap;
    filtered: OpenMap;
};
export declare const actions: {
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
};
export declare function reducer(state: OpenSlice | undefined, action: ActionTypes<typeof actions>): OpenSlice;
