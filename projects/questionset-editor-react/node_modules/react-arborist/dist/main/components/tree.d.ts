import { TreeApi } from "../interfaces/tree-api";
import { TreeProps } from "../types/tree-props";
declare function TreeComponent<T>(props: TreeProps<T>, ref: React.Ref<TreeApi<T> | undefined>): import("react/jsx-runtime").JSX.Element;
export declare const Tree: <T>(props: TreeProps<T> & {
    ref?: React.ForwardedRef<TreeApi<T> | undefined>;
}) => ReturnType<typeof TreeComponent>;
export {};
