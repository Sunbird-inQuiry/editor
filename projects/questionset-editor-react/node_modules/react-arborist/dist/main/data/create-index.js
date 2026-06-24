"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIndex = void 0;
const createIndex = (nodes) => {
    return nodes.reduce((map, node, index) => {
        map[node.id] = index;
        return map;
    }, {});
};
exports.createIndex = createIndex;
