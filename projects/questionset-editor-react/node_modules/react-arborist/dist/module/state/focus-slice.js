/* Types */
/* Actions */
export function focus(id) {
    return { type: "FOCUS", id };
}
export function treeBlur() {
    return { type: "TREE_BLUR" };
}
/* Reducer */
export function reducer(state = { id: null, treeFocused: false }, action) {
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
