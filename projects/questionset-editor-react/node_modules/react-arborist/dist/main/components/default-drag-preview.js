"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultDragPreview = DefaultDragPreview;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const context_1 = require("../context");
const layerStyles = {
    position: "fixed",
    pointerEvents: "none",
    zIndex: 100,
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
};
const getStyle = (offset) => {
    if (!offset)
        return { display: "none" };
    const { x, y } = offset;
    return { transform: `translate(${x}px, ${y}px)` };
};
const getCountStyle = (offset) => {
    if (!offset)
        return { display: "none" };
    const { x, y } = offset;
    return { transform: `translate(${x + 10}px, ${y + 10}px)` };
};
function DefaultDragPreview({ offset, mouse, id, dragIds, isDragging }) {
    return ((0, jsx_runtime_1.jsxs)(Overlay, { isDragging: isDragging, children: [(0, jsx_runtime_1.jsx)(Position, { offset: offset, children: (0, jsx_runtime_1.jsx)(PreviewNode, { id: id, dragIds: dragIds }) }), (0, jsx_runtime_1.jsx)(Count, { mouse: mouse, count: dragIds.length })] }));
}
const Overlay = (0, react_1.memo)(function Overlay(props) {
    if (!props.isDragging)
        return null;
    return (0, jsx_runtime_1.jsx)("div", { style: layerStyles, children: props.children });
});
function Position(props) {
    return ((0, jsx_runtime_1.jsx)("div", { className: "row preview", style: getStyle(props.offset), children: props.children }));
}
function Count(props) {
    const { count, mouse } = props;
    if (count > 1)
        return ((0, jsx_runtime_1.jsx)("div", { className: "selected-count", style: getCountStyle(mouse), children: count }));
    else
        return null;
}
const PreviewNode = (0, react_1.memo)(function PreviewNode(props) {
    const tree = (0, context_1.useTreeApi)();
    const node = tree.get(props.id);
    if (!node)
        return null;
    return ((0, jsx_runtime_1.jsx)(tree.renderNode, { preview: true, node: node, style: {
            paddingLeft: node.level * tree.indent,
            opacity: 0.2,
            background: "transparent",
        }, tree: tree }));
});
