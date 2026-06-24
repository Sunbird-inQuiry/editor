import { NodeApi } from "../interfaces/node-api";
export const ROOT_ID = "__REACT_ARBORIST_INTERNAL_ROOT__";
export function createRoot(tree) {
    var _a;
    function visitSelfAndChildren(data, level, parent) {
        const id = tree.accessId(data);
        const node = new NodeApi({
            tree,
            data,
            level,
            parent,
            id,
            children: null,
            isDraggable: tree.isDraggable(data),
            rowIndex: null,
        });
        const children = tree.accessChildren(data);
        if (children) {
            node.children = children.map((child) => visitSelfAndChildren(child, level + 1, node));
        }
        return node;
    }
    const root = new NodeApi({
        tree,
        id: ROOT_ID,
        // @ts-ignore
        data: { id: ROOT_ID },
        level: -1,
        parent: null,
        children: null,
        isDraggable: true,
        rowIndex: null,
    });
    const data = (_a = tree.props.data) !== null && _a !== void 0 ? _a : [];
    root.children = data.map((child) => {
        return visitSelfAndChildren(child, 0, root);
    });
    return root;
}
