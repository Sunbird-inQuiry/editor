"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultRow = DefaultRow;
const jsx_runtime_1 = require("react/jsx-runtime");
function DefaultRow({ node, attrs, innerRef, children }) {
    return ((0, jsx_runtime_1.jsx)("div", Object.assign({}, attrs, { ref: innerRef, onFocus: (e) => e.stopPropagation(), onClick: node.handleClick, children: children })));
}
