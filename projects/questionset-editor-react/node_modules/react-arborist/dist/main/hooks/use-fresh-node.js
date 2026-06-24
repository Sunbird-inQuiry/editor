"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFreshNode = useFreshNode;
const react_1 = require("react");
const context_1 = require("../context");
function useFreshNode(index) {
    const tree = (0, context_1.useTreeApi)();
    const original = tree.at(index);
    if (!original)
        throw new Error(`Could not find node for index: ${index}`);
    return (0, react_1.useMemo)(() => {
        const fresh = original.clone();
        tree.visibleNodes[index] = fresh; // sneaky
        return fresh;
        // Return a fresh instance if the state values change
    }, [...Object.values(original.state), original]);
}
