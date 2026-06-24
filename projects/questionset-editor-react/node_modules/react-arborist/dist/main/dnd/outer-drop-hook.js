"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOuterDrop = useOuterDrop;
const react_dnd_1 = require("react-dnd");
const context_1 = require("../context");
const compute_drop_1 = require("./compute-drop");
const dnd_slice_1 = require("../state/dnd-slice");
function useOuterDrop() {
    const tree = (0, context_1.useTreeApi)();
    // In case we drop an item at the bottom of the list
    const [, drop] = (0, react_dnd_1.useDrop)(() => ({
        accept: "NODE",
        canDrop: (_item, m) => {
            if (!m.isOver({ shallow: true }))
                return false;
            return tree.canDrop();
        },
        hover: (_item, m) => {
            if (!m.isOver({ shallow: true }))
                return;
            const offset = m.getClientOffset();
            if (!tree.listEl.current || !offset)
                return;
            const { cursor, drop } = (0, compute_drop_1.computeDrop)({
                element: tree.listEl.current,
                offset: offset,
                indent: tree.indent,
                node: null,
                prevNode: tree.visibleNodes[tree.visibleNodes.length - 1],
                nextNode: null,
            });
            if (drop)
                tree.dispatch(dnd_slice_1.actions.hovering(drop.parentId, drop.index));
            if (m.canDrop()) {
                if (cursor)
                    tree.showCursor(cursor);
            }
            else {
                tree.hideCursor();
            }
        },
        drop: (_item, m) => {
            if (!m.isOver({ shallow: true }))
                return null;
            if (!m.canDrop())
                return null;
            tree.drop();
        },
    }), [tree]);
    drop(tree.listEl);
}
