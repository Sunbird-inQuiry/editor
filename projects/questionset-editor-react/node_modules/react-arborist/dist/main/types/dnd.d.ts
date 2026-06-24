export type CursorLocation = {
    index: number | null;
    level: number | null;
    parentId: string | null;
};
export type DragItem<T = any> = {
    id: string;
    dragIds: string[];
    data: T;
};
