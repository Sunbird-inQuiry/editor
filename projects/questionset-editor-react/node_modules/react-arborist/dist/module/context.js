import { createContext, useContext } from "react";
export const TreeApiContext = createContext(null);
export function useTreeApi() {
    const value = useContext(TreeApiContext);
    if (value === null)
        throw new Error("No Tree Api Provided");
    return value;
}
export const NodesContext = createContext(null);
export function useNodesContext() {
    const value = useContext(NodesContext);
    if (value === null)
        throw new Error("Provide a NodesContext");
    return value;
}
export const DndContext = createContext(null);
export function useDndContext() {
    const value = useContext(DndContext);
    if (value === null)
        throw new Error("Provide a DnDContext");
    return value;
}
export const DataUpdatesContext = createContext(0);
export function useDataUpdates() {
    useContext(DataUpdatesContext);
}
