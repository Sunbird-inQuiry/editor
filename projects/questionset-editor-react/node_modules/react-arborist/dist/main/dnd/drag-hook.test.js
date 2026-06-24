"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const drag_hook_1 = require("./drag-hook");
/* dragTypeForNode only reads node.data when dragType is a function, so a
   minimal stub stands in for a real NodeApi. */
function nodeWith(data) {
    return { data };
}
test("defaults to the internal NODE type when dragType is undefined", () => {
    expect((0, drag_hook_1.dragTypeForNode)(undefined, nodeWith({ id: "a" }))).toBe("NODE");
});
test("uses a fixed string dragType for every node", () => {
    expect((0, drag_hook_1.dragTypeForNode)("FILE", nodeWith({ id: "a" }))).toBe("FILE");
});
test("resolves a per-node dragType function against the node", () => {
    const dragType = (node) => node.data.kind.toUpperCase();
    expect((0, drag_hook_1.dragTypeForNode)(dragType, nodeWith({ kind: "folder" }))).toBe("FOLDER");
    expect((0, drag_hook_1.dragTypeForNode)(dragType, nodeWith({ kind: "file" }))).toBe("FILE");
});
/* canDragNode only reads the isDraggable/isEditing flags, so a minimal stub
   stands in for a real NodeApi. */
function draggableNode(flags) {
    return flags;
}
test("a draggable node that isn't being edited can drag", () => {
    expect((0, drag_hook_1.canDragNode)(draggableNode({ isDraggable: true, isEditing: false }))).toBe(true);
});
test("a non-draggable node can't drag", () => {
    expect((0, drag_hook_1.canDragNode)(draggableNode({ isDraggable: false, isEditing: false }))).toBe(false);
});
test("a node being renamed can't drag, even when draggable (#195)", () => {
    expect((0, drag_hook_1.canDragNode)(draggableNode({ isDraggable: true, isEditing: true }))).toBe(false);
});
