"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dragTypeForNode = dragTypeForNode;
exports.canDragNode = canDragNode;
exports.useDragHook = useDragHook;
const react_1 = require("react");
const react_dnd_1 = require("react-dnd");
const react_dnd_html5_backend_1 = require("react-dnd-html5-backend");
const context_1 = require("../context");
const dnd_slice_1 = require("../state/dnd-slice");
/* The react-dnd item type a row's drag source broadcasts. The dragType prop
   can be a fixed string or a per-node function; it defaults to "NODE". */
function dragTypeForNode(dragType, node) {
    if (typeof dragType === "function")
        return dragType(node);
    return dragType !== null && dragType !== void 0 ? dragType : "NODE";
}
/* A node can start a drag only when it's draggable and not currently being
   renamed. Without the editing guard, dragging inside the rename input would
   pick the row up and move it (issue #195). */
function canDragNode(node) {
    return node.isDraggable && !node.isEditing;
}
function useDragHook(node) {
    const tree = (0, context_1.useTreeApi)();
    const ids = tree.selectedIds;
    const [_, ref, preview] = (0, react_dnd_1.useDrag)(() => ({
        canDrag: () => canDragNode(node),
        type: dragTypeForNode(tree.props.dragType, node),
        item: () => {
            // This is fired once at the beginning of a drag operation
            const dragIds = tree.isSelected(node.id) ? Array.from(ids) : [node.id];
            tree.dispatch(dnd_slice_1.actions.dragStart(node.id, dragIds));
            return { id: node.id, dragIds, data: node.data };
        },
        end: () => {
            tree.hideCursor();
            tree.redrawList();
            tree.dispatch(dnd_slice_1.actions.dragEnd());
        },
    }), [ids, node, tree.props.dragType]);
    (0, react_1.useEffect)(() => {
        preview((0, react_dnd_html5_backend_1.getEmptyImage)());
    }, [preview]);
    return ref;
}
