import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from "react";
import { useTreeApi } from "../context";
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
export function DefaultDragPreview({ offset, mouse, id, dragIds, isDragging }) {
    return (_jsxs(Overlay, { isDragging: isDragging, children: [_jsx(Position, { offset: offset, children: _jsx(PreviewNode, { id: id, dragIds: dragIds }) }), _jsx(Count, { mouse: mouse, count: dragIds.length })] }));
}
const Overlay = memo(function Overlay(props) {
    if (!props.isDragging)
        return null;
    return _jsx("div", { style: layerStyles, children: props.children });
});
function Position(props) {
    return (_jsx("div", { className: "row preview", style: getStyle(props.offset), children: props.children }));
}
function Count(props) {
    const { count, mouse } = props;
    if (count > 1)
        return (_jsx("div", { className: "selected-count", style: getCountStyle(mouse), children: count }));
    else
        return null;
}
const PreviewNode = memo(function PreviewNode(props) {
    const tree = useTreeApi();
    const node = tree.get(props.id);
    if (!node)
        return null;
    return (_jsx(tree.renderNode, { preview: true, node: node, style: {
            paddingLeft: node.level * tree.indent,
            opacity: 0.2,
            background: "transparent",
        }, tree: tree }));
});
