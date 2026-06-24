"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultCursor = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
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
exports.DefaultCursor = react_1.default.memo(function DefaultCursor({ top, left, indent }) {
    const style = {
        position: "absolute",
        pointerEvents: "none",
        top: top - 2 + "px",
        left: left + "px",
        right: indent + "px",
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: Object.assign(Object.assign({}, placeholderStyle), style), children: [(0, jsx_runtime_1.jsx)("div", { style: Object.assign({}, circleStyle) }), (0, jsx_runtime_1.jsx)("div", { style: Object.assign({}, lineStyle) })] }));
});
