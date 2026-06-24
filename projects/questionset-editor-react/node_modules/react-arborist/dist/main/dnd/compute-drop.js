"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeDrop = computeDrop;
const utils_1 = require("../utils");
function measureHover(el, offset) {
    const rect = el.getBoundingClientRect();
    const x = offset.x - Math.round(rect.x);
    const y = offset.y - Math.round(rect.y);
    const height = rect.height;
    const inTopHalf = y < height / 2;
    const inBottomHalf = !inTopHalf;
    const pad = height / 4;
    const inMiddle = y > pad && y < height - pad;
    const atTop = !inMiddle && inTopHalf;
    const atBottom = !inMiddle && inBottomHalf;
    return { x, inTopHalf, inBottomHalf, inMiddle, atTop, atBottom };
}
function getNodesAroundCursor(node, prev, next, hover) {
    if (!node) {
        // We're hovering over the empty part of the list, not over an item,
        // Put the cursor below the last item which is "prev"
        return [prev, null];
    }
    if (node.isInternal) {
        if (hover.atTop) {
            return [prev, node];
        }
        else if (hover.inMiddle) {
            return [node, node];
        }
        else {
            return [node, next];
        }
    }
    else {
        if (hover.inTopHalf) {
            return [prev, node];
        }
        else {
            return [node, next];
        }
    }
}
function dropAt(parentId, index) {
    return { parentId: parentId || null, index };
}
function lineCursor(index, level) {
    return {
        type: "line",
        index,
        level,
    };
}
function noCursor() {
    return {
        type: "none",
    };
}
function highlightCursor(id) {
    return {
        type: "highlight",
        id,
    };
}
function walkUpFrom(node, level) {
    var _a;
    let drop = node;
    while (drop.parent && drop.level > level) {
        drop = drop.parent;
    }
    const parentId = ((_a = drop.parent) === null || _a === void 0 ? void 0 : _a.id) || null;
    const index = (0, utils_1.indexOf)(drop) + 1;
    return { parentId, index };
}
/**
 * This is the most complex, tricky function in the whole repo.
 */
function computeDrop(args) {
    var _a;
    const hover = measureHover(args.element, args.offset);
    const indent = args.indent;
    const hoverLevel = Math.round(Math.max(0, hover.x - indent) / indent);
    const { node, nextNode, prevNode } = args;
    const [above, below] = getNodesAroundCursor(node, prevNode, nextNode, hover);
    /* Hovering over the middle of a folder */
    if (node && node.isInternal && hover.inMiddle) {
        return {
            drop: dropAt(node.id, null),
            cursor: highlightCursor(node.id),
        };
    }
    /*
     * Now we only need to care about the node above the cursor
     * -----------                            -------
     */
    /* There is no node above the cursor line */
    if (!above) {
        return {
            drop: dropAt((_a = below === null || below === void 0 ? void 0 : below.parent) === null || _a === void 0 ? void 0 : _a.id, 0),
            cursor: lineCursor(0, 0),
        };
    }
    /* The node above the cursor line is an item */
    if ((0, utils_1.isItem)(above)) {
        const level = (0, utils_1.bound)(hoverLevel, (below === null || below === void 0 ? void 0 : below.level) || 0, above.level);
        return {
            drop: walkUpFrom(above, level),
            cursor: lineCursor(above.rowIndex + 1, level),
        };
    }
    /* The node above the cursor line is a closed folder */
    if ((0, utils_1.isClosed)(above)) {
        const level = (0, utils_1.bound)(hoverLevel, (below === null || below === void 0 ? void 0 : below.level) || 0, above.level);
        return {
            drop: walkUpFrom(above, level),
            cursor: lineCursor(above.rowIndex + 1, level),
        };
    }
    /* The node above the cursor line is an open folder with no children */
    if ((0, utils_1.isOpenWithEmptyChildren)(above)) {
        const level = (0, utils_1.bound)(hoverLevel, 0, above.level + 1);
        if (level > above.level) {
            /* Will be the first child of the empty folder */
            return {
                drop: dropAt(above.id, 0),
                cursor: lineCursor(above.rowIndex + 1, level),
            };
        }
        else {
            /* Will be a sibling or grandsibling of the empty folder */
            return {
                drop: walkUpFrom(above, level),
                cursor: lineCursor(above.rowIndex + 1, level),
            };
        }
    }
    /* The node above the cursor is a an open folder with children */
    return {
        drop: dropAt(above === null || above === void 0 ? void 0 : above.id, 0),
        cursor: lineCursor(above.rowIndex + 1, above.level + 1),
    };
}
