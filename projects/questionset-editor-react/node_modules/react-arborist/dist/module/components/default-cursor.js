import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
const placeholderStyle = {
    display: "flex",
    alignItems: "center",
    zIndex: 1,
};
const lineStyle = {
    flex: 1,
    height: "2px",
    background: "#4B91E2",
    borderRadius: "1px",
};
const circleStyle = {
    width: "4px",
    height: "4px",
    boxShadow: "0 0 0 3px #4B91E2",
    borderRadius: "50%",
};
export const DefaultCursor = React.memo(function DefaultCursor({ top, left, indent }) {
    const style = {
        position: "absolute",
        pointerEvents: "none",
        top: top - 2 + "px",
        left: left + "px",
        right: indent + "px",
    };
    return (_jsxs("div", { style: Object.assign(Object.assign({}, placeholderStyle), style), children: [_jsx("div", { style: Object.assign({}, circleStyle) }), _jsx("div", { style: Object.assign({}, lineStyle) })] }));
});
