import { XYCoord } from "react-dnd";
export declare function measureHover(el: HTMLElement, offset: XYCoord, indent: number): {
    level: number;
    inTopHalf: boolean;
    inBottomHalf: boolean;
    inMiddle: boolean;
};
export type HoverData = ReturnType<typeof measureHover>;
