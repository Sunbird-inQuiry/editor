"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tree = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const provider_1 = require("./provider");
const outer_drop_1 = require("./outer-drop");
const tree_container_1 = require("./tree-container");
const drag_preview_container_1 = require("./drag-preview-container");
const use_validated_props_1 = require("../hooks/use-validated-props");
function TreeComponent(props, ref) {
    const treeProps = (0, use_validated_props_1.useValidatedProps)(props);
    return ((0, jsx_runtime_1.jsxs)(provider_1.TreeProvider, { treeProps: treeProps, imperativeHandle: ref, children: [(0, jsx_runtime_1.jsx)(outer_drop_1.OuterDrop, { children: (0, jsx_runtime_1.jsx)(tree_container_1.TreeContainer, {}) }), (0, jsx_runtime_1.jsx)(drag_preview_container_1.DragPreviewContainer, {})] }));
}
exports.Tree = (0, react_1.forwardRef)(TreeComponent);
