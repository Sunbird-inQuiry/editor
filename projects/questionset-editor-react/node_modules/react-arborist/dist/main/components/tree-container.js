"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeContainer = TreeContainer;
const jsx_runtime_1 = require("react/jsx-runtime");
const context_1 = require("../context");
const default_container_1 = require("./default-container");
function TreeContainer() {
    const tree = (0, context_1.useTreeApi)();
    const Container = tree.props.renderContainer || default_container_1.DefaultContainer;
    return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)(Container, {}) }));
}
