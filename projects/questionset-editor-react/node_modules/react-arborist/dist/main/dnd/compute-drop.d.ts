import { XYCoord } from "react-dnd";
import { NodeApi } from "../interfaces/node-api";
import { DropResult } from "./drop-hook";
type Args = {
    element: HTMLElement;
    offset: XYCoord;
    indent: number;
    node: NodeApi | null;
    prevNode: NodeApi | null;
    nextNode: NodeApi | null;
};
export type ComputedDrop = {
    drop: DropResult | null;
    cursor: Cursor | null;
};
declare function lineCursor(index: number, level: number): {
    type: "line";
    index: number;
    level: number;
};
declare function noCursor(): {
    type: "none";
};
declare function highlightCursor(id: string): {
    type: "highlight";
    id: string;
};
export type LineCursor = ReturnType<typeof lineCursor>;
export type NoCursor = ReturnType<typeof noCursor>;
export type HighlightCursor = ReturnType<typeof highlightCursor>;
export type Cursor = LineCursor | NoCursor | HighlightCursor;
/**
 * This is the most complex, tricky function in the whole repo.
 */
export declare function computeDrop(args: Args): ComputedDrop;
export {};
