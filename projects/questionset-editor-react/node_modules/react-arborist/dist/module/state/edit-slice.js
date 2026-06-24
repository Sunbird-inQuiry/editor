/* Actions */
export function edit(id) {
    return { type: "EDIT", id };
}
/* Reducer */
export function reducer(state = { id: null }, action) {
    if (action.type === "EDIT") {
        return Object.assign(Object.assign({}, state), { id: action.id });
    }
    else {
        return state;
    }
}
