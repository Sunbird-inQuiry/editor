import { jsx as _jsx } from "react/jsx-runtime";
import { useDndContext, useTreeApi } from "../context";
export function Cursor() {
    var _a, _b;
    const tree = useTreeApi();
    const state = useDndContext();
    const cursor = state.cursor;
    if (!cursor || cursor.type !== "line")
        return null;
    const indent = tree.indent;
    const top = tree.rowTopPosition(cursor.index) + ((_b = (_a = tree.props.padding) !== null && _a !== void 0 ? _a : tree.props.paddingTop) !== null && _b !== void 0 ? _b : 0);
    const left = indent * cursor.level;
    const Cursor = tree.renderCursor;
    return _jsx(Cursor, { top, left, indent });
}
