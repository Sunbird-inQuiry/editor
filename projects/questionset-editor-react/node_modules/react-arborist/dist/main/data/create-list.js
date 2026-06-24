"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createList = createList;
function createList(tree) {
    if (tree.isFiltered) {
        return flattenAndFilterTree(tree.root, tree.isMatch.bind(tree));
    }
    else {
        return flattenTree(tree.root);
    }
}
function flattenTree(root) {
    const list = [];
    function collect(node) {
        var _a;
        if (node.level >= 0) {
            list.push(node);
        }
        if (node.isOpen) {
            (_a = node.children) === null || _a === void 0 ? void 0 : _a.forEach(collect);
        }
    }
    collect(root);
    list.forEach(assignRowIndex);
    return list;
}
function flattenAndFilterTree(root, isMatch) {
    const matches = {};
    const list = [];
    function markMatch(node) {
        const yes = !node.isRoot && isMatch(node);
        if (yes) {
            matches[node.id] = true;
            let parent = node.parent;
            while (parent) {
                matches[parent.id] = true;
                parent = parent.parent;
            }
        }
        if (node.children) {
            for (let child of node.children)
                markMatch(child);
        }
    }
    function collect(node) {
        var _a;
        if (node.level >= 0 && matches[node.id]) {
            list.push(node);
        }
        if (node.isOpen) {
            (_a = node.children) === null || _a === void 0 ? void 0 : _a.forEach(collect);
        }
    }
    markMatch(root);
    collect(root);
    list.forEach(assignRowIndex);
    return list;
}
function assignRowIndex(node, index) {
    node.rowIndex = index;
}
