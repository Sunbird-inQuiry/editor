"use strict";
/* Types */
Object.defineProperty(exports, "__esModule", { value: true });
exports.focus = focus;
exports.treeBlur = treeBlur;
exports.reducer = reducer;
/* Actions */
function focus(id) {
    return { type: "FOCUS", id };
}
function treeBlur() {
    return { type: "TREE_BLUR" };
}
/* Reducer */
function reducer(state = { id: null, treeFocused: false }, action) {
    if (action.type === "FOCUS") {
        return Object.assign(Object.assign({}, state), { id: action.id, treeFocused: true });
    }
    else if (action.type === "TREE_BLUR") {
        return Object.assign(Object.assign({}, state), { treeFocused: false });
    }
    else {
        return state;
    }
}
