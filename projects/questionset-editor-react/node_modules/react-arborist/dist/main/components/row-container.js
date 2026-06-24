"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowContainer = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const context_1 = require("../context");
const drag_hook_1 = require("../dnd/drag-hook");
const drop_hook_1 = require("../dnd/drop-hook");
const use_fresh_node_1 = require("../hooks/use-fresh-node");
exports.RowContainer = react_1.default.memo(function RowContainer({ index, style }) {
    /* When will the <Row> will re-render.
     *
     * The row component is memo'd so it will only render
     * when a new instance of the NodeApi class is passed
     * to it.
     *
     * The TreeApi instance is stable. It does not
     * change when the internal state changes.
     *
     * The TreeApi has all the references to the nodes.
     * We need to clone the nodes when their state
     * changes. The node class contains no state itself,
     * It always checks the tree for state. The tree's
     * state will always be up to date.
     */
    (0, context_1.useDataUpdates)(); // Re-render when tree props or visability changes
    const _ = (0, context_1.useNodesContext)(); // So that we re-render appropriately
    const tree = (0, context_1.useTreeApi)(); // Tree already has the fresh state
    const node = (0, use_fresh_node_1.useFreshNode)(index);
    const el = (0, react_1.useRef)(null);
    const dragRef = (0, drag_hook_1.useDragHook)(node);
    const dropRef = (0, drop_hook_1.useDropHook)(el, node);
    const innerRef = (0, react_1.useCallback)((n) => {
        el.current = n;
        dropRef(n);
    }, [dropRef]);
    const indent = tree.indent * node.level;
    const nodeStyle = (0, react_1.useMemo)(() => ({ paddingLeft: indent }), [indent]);
    const rowStyle = (0, react_1.useMemo)(() => {
        var _a, _b;
        return (Object.assign(Object.assign({}, style), { top: parseFloat(style.top) + ((_b = (_a = tree.props.padding) !== null && _a !== void 0 ? _a : tree.props.paddingTop) !== null && _b !== void 0 ? _b : 0), 
            // react-window gives the row width: 100% of the viewport. When a deeply
            // nested (or long) node overflows horizontally, that clips the row's
            // background/selection highlight at the viewport edge. min-width:
            // max-content lets the row grow with its content so the highlight spans
            // the full scrollable width (#10).
            minWidth: "max-content" }));
    }, [style, tree.props.padding, tree.props.paddingTop]);
    const rowAttrs = {
        role: "treeitem",
        "aria-level": node.level + 1,
        "aria-selected": node.isSelected,
        "aria-expanded": node.isOpen,
        style: rowStyle,
        tabIndex: -1,
        className: tree.props.rowClassName,
    };
    (0, react_1.useEffect)(() => {
        var _a;
        if (!node.isEditing && node.isFocused) {
            (_a = el.current) === null || _a === void 0 ? void 0 : _a.focus({ preventScroll: true });
        }
    }, [node.isEditing, node.isFocused, el.current]);
    const Node = tree.renderNode;
    const Row = tree.renderRow;
    return ((0, jsx_runtime_1.jsx)(Row, { node: node, innerRef: innerRef, attrs: rowAttrs, children: (0, jsx_runtime_1.jsx)(Node, { node: node, tree: tree, style: nodeStyle, dragHandle: dragRef }) }));
});
