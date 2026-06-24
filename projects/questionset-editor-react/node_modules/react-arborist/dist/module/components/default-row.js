import { jsx as _jsx } from "react/jsx-runtime";
export function DefaultRow({ node, attrs, innerRef, children }) {
    return (_jsx("div", Object.assign({}, attrs, { ref: innerRef, onFocus: (e) => e.stopPropagation(), onClick: node.handleClick, children: children })));
}
