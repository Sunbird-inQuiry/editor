import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from "react";
import { TreeProvider } from "./provider";
import { OuterDrop } from "./outer-drop";
import { TreeContainer } from "./tree-container";
import { DragPreviewContainer } from "./drag-preview-container";
import { useValidatedProps } from "../hooks/use-validated-props";
function TreeComponent(props, ref) {
    const treeProps = useValidatedProps(props);
    return (_jsxs(TreeProvider, { treeProps: treeProps, imperativeHandle: ref, children: [_jsx(OuterDrop, { children: _jsx(TreeContainer, {}) }), _jsx(DragPreviewContainer, {})] }));
}
export const Tree = forwardRef(TreeComponent);
