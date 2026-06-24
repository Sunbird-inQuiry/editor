import { useDrop } from "react-dnd";
import { useTreeApi } from "../context";
import { computeDrop } from "./compute-drop";
import { actions as dnd } from "../state/dnd-slice";
export function useDropHook(el, node) {
    const tree = useTreeApi();
    const [_, dropRef] = useDrop(() => ({
        accept: "NODE",
        canDrop: () => tree.canDrop(),
        hover: (_item, m) => {
            const offset = m.getClientOffset();
            if (!el.current || !offset)
                return;
            const { cursor, drop } = computeDrop({
                element: el.current,
                offset: offset,
                indent: tree.indent,
                node: node,
                prevNode: node.prev,
                nextNode: node.next,
            });
            if (drop)
                tree.dispatch(dnd.hovering(drop.parentId, drop.index));
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
