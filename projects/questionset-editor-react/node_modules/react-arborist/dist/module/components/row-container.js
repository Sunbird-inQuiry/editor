import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useDataUpdates, useNodesContext, useTreeApi } from "../context";
import { useDragHook } from "../dnd/drag-hook";
import { useDropHook } from "../dnd/drop-hook";
import { useFreshNode } from "../hooks/use-fresh-node";
export const RowContainer = React.memo(function RowContainer({ index, style }) {
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
    useDataUpdates(); // Re-render when tree props or visability changes
    const _ = useNodesContext(); // So that we re-render appropriately
    const tree = useTreeApi(); // Tree already has the fresh state
    const node = useFreshNode(index);
    const el = useRef(null);
    const dragRef = useDragHook(node);
    const dropRef = useDropHook(el, node);
    const innerRef = useCallback((n) => {
        el.current = n;
        dropRef(n);
    }, [dropRef]);
    const indent = tree.indent * node.level;
    const nodeStyle = useMemo(() => ({ paddingLeft: indent }), [indent]);
    const rowStyle = useMemo(() => {
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
    useEffect(() => {
        var _a;
        if (!node.isEditing && node.isFocused) {
            (_a = el.current) === null || _a === void 0 ? void 0 : _a.focus({ preventScroll: true });
        }
    }, [node.isEditing, node.isFocused, el.current]);
    const Node = tree.renderNode;
    const Row = tree.renderRow;
    return (_jsx(Row, { node: node, innerRef: innerRef, attrs: rowAttrs, children: _jsx(Node, { node: node, tree: tree, style: nodeStyle, dragHandle: dragRef }) }));
});
