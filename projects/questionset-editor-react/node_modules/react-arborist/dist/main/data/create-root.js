"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROOT_ID = void 0;
exports.createRoot = createRoot;
const node_api_1 = require("../interfaces/node-api");
exports.ROOT_ID = "__REACT_ARBORIST_INTERNAL_ROOT__";
function createRoot(tree) {
    var _a;
    function visitSelfAndChildren(data, level, parent) {
        const id = tree.accessId(data);
        const node = new node_api_1.NodeApi({
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
    const root = new node_api_1.NodeApi({
        tree,
        id: exports.ROOT_ID,
        // @ts-ignore
        data: { id: exports.ROOT_ID },
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
