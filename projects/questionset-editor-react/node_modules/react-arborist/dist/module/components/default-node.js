import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
export function DefaultNode(props) {
    return (_jsxs("div", { ref: props.dragHandle, style: props.style, children: [_jsx("span", { onClick: (e) => {
                    e.stopPropagation();
                    props.node.toggle();
                }, children: props.node.isLeaf ? "🌳" : props.node.isOpen ? "🗁" : "🗀" }), " ", props.node.isEditing ? _jsx(Edit, Object.assign({}, props)) : _jsx(Show, Object.assign({}, props))] }));
}
function Show(props) {
    return (_jsx(_Fragment, { children: _jsx("span", { children: props.node.data.name }) }));
}
function Edit({ node }) {
    const input = useRef();
    useEffect(() => {
        var _a, _b;
        (_a = input.current) === null || _a === void 0 ? void 0 : _a.focus();
        (_b = input.current) === null || _b === void 0 ? void 0 : _b.select();
    }, []);
    return (_jsx("input", { ref: input, 
        // @ts-ignore
        defaultValue: node.data.name, onBlur: () => node.reset(), onKeyDown: (e) => {
            var _a;
            if (e.key === "Escape")
                node.reset();
            if (e.key === "Enter")
                node.submit(((_a = input.current) === null || _a === void 0 ? void 0 : _a.value) || "");
        } }));
}
