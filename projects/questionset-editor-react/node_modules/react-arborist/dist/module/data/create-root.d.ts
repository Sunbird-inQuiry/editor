import { NodeApi } from "../interfaces/node-api";
import { TreeApi } from "../interfaces/tree-api";
export declare const ROOT_ID = "__REACT_ARBORIST_INTERNAL_ROOT__";
export declare function createRoot<T>(tree: TreeApi<T>): NodeApi<T>;
