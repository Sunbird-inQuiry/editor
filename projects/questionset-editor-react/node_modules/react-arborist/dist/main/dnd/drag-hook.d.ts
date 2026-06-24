import { ConnectDragSource } from "react-dnd";
import { NodeApi } from "../interfaces/node-api";
import { TreeProps } from "../types/tree-props";
export declare function dragTypeForNode<T>(dragType: TreeProps<T>["dragType"], node: NodeApi<T>): string;
export declare function canDragNode<T>(node: NodeApi<T>): boolean;
export declare function useDragHook<T>(node: NodeApi<T>): ConnectDragSource;
