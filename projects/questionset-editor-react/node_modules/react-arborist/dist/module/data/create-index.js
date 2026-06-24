export const createIndex = (nodes) => {
    return nodes.reduce((map, node, index) => {
        map[node.id] = index;
        return map;
    }, {});
};
