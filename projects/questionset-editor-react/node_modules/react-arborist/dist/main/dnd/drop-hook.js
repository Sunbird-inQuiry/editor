"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDropHook = useDropHook;
const react_dnd_1 = require("react-dnd");
const context_1 = require("../context");
const compute_drop_1 = require("./compute-drop");
const dnd_slice_1 = require("../state/dnd-slice");
function useDropHook(el, node) {
    const tree = (0, context_1.useTreeApi)();
    const [_, dropRef] = (0, react_dnd_1.useDrop)(() => ({
        accept: "NODE",
        canDrop: () => tree.canDrop(),
        hover: (_item, m) => {
            const offset = m.getClientOffset();
            if (!el.current || !offset)
                return;
            const { cursor, drop } = (0, compute_drop_1.computeDrop)({
                element: el.current,
                offset: offset,
                indent: tree.indent,
                node: node,
                prevNode: node.prev,
                nextNode: node.next,
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
        drop: (_, m) => {
            if (!m.canDrop())
                return null;
            tree.drop();
        },
    }), [node, el.current, tree.props]);
    return dropRef;
}
