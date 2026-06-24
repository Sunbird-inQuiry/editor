"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DragPreviewContainer = DragPreviewContainer;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_dnd_1 = require("react-dnd");
const context_1 = require("../context");
const default_drag_preview_1 = require("./default-drag-preview");
function DragPreviewContainer() {
    const tree = (0, context_1.useTreeApi)();
    const { offset, mouse, item, isDragging } = (0, react_dnd_1.useDragLayer)((m) => {
        return {
            offset: m.getSourceClientOffset(),
            mouse: m.getClientOffset(),
            item: m.getItem(),
            isDragging: m.isDragging(),
        };
    });
    const DragPreview = tree.props.renderDragPreview || default_drag_preview_1.DefaultDragPreview;
    return ((0, jsx_runtime_1.jsx)(DragPreview, { offset: offset, mouse: mouse, id: (item === null || item === void 0 ? void 0 : item.id) || null, dragIds: (item === null || item === void 0 ? void 0 : item.dragIds) || [], isDragging: isDragging }));
}
