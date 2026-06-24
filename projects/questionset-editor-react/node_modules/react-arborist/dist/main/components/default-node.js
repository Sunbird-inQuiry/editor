"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultNode = DefaultNode;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
function DefaultNode(props) {
    return ((0, jsx_runtime_1.jsxs)("div", { ref: props.dragHandle, style: props.style, children: [(0, jsx_runtime_1.jsx)("span", { onClick: (e) => {
                    e.stopPropagation();
                    props.node.toggle();
                }, children: props.node.isLeaf ? "🌳" : props.node.isOpen ? "🗁" : "🗀" }), " ", props.node.isEditing ? (0, jsx_runtime_1.jsx)(Edit, Object.assign({}, props)) : (0, jsx_runtime_1.jsx)(Show, Object.assign({}, props))] }));
}
function Show(props) {
    return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)("span", { children: props.node.data.name }) }));
}
function Edit({ node }) {
    const input = (0, react_1.useRef)();
    (0, react_1.useEffect)(() => {
        var _a, _b;
        (_a = input.current) === null || _a === void 0 ? void 0 : _a.focus();
        (_b = input.current) === null || _b === void 0 ? void 0 : _b.select();
    }, []);
    return ((0, jsx_runtime_1.jsx)("input", { ref: input, 
        // @ts-ignore
        defaultValue: node.data.name, onBlur: () => node.reset(), onKeyDown: (e) => {
            var _a;
            if (e.key === "Escape")
                node.reset();
            if (e.key === "Enter")
                node.submit(((_a = input.current) === null || _a === void 0 ? void 0 : _a.value) || "");
        } }));
}
