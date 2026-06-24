import { useEffect } from "react";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { useTreeApi } from "../context";
import { actions as dnd } from "../state/dnd-slice";
/* The react-dnd item type a row's drag source broadcasts. The dragType prop
   can be a fixed string or a per-node function; it defaults to "NODE". */
export function dragTypeForNode(dragType, node) {
    if (typeof dragType === "function")
        return dragType(node);
    return dragType !== null && dragType !== void 0 ? dragType : "NODE";
}
/* A node can start a drag only when it's draggable and not currently being
   renamed. Without the editing guard, dragging inside the rename input would
   pick the row up and move it (issue #195). */
export function canDragNode(node) {
    return node.isDraggable && !node.isEditing;
}
export function useDragHook(node) {
    const tree = useTreeApi();
    const ids = tree.selectedIds;
    const [_, ref, preview] = useDrag(() => ({
        canDrag: () => canDragNode(node),
        type: dragTypeForNode(tree.props.dragType, node),
        item: () => {
            // This is fired once at the beginning of a drag operation
            const dragIds = tree.isSelected(node.id) ? Array.from(ids) : [node.id];
            tree.dispatch(dnd.dragStart(node.id, dragIds));
            return { id: node.id, dragIds, data: node.data };
        },
        end: () => {
            tree.hideCursor();
            tree.redrawList();
            tree.dispatch(dnd.dragEnd());
        },
    }), [ids, node, tree.props.dragType]);
    useEffect(() => {
        preview(getEmptyImage());
    }, [preview]);
    return ref;
}
