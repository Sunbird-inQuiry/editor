"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cursor = Cursor;
const jsx_runtime_1 = require("react/jsx-runtime");
const context_1 = require("../context");
function Cursor() {
    var _a, _b;
    const tree = (0, context_1.useTreeApi)();
    const state = (0, context_1.useDndContext)();
    const cursor = state.cursor;
    if (!cursor || cursor.type !== "line")
        return null;
    const indent = tree.indent;
    const top = tree.rowTopPosition(cursor.index) + ((_b = (_a = tree.props.padding) !== null && _a !== void 0 ? _a : tree.props.paddingTop) !== null && _b !== void 0 ? _b : 0);
    const left = indent * cursor.level;
    const Cursor = tree.renderCursor;
    return (0, jsx_runtime_1.jsx)(Cursor, { top, left, indent });
}
