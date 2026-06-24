"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.edit = edit;
exports.reducer = reducer;
/* Actions */
function edit(id) {
    return { type: "EDIT", id };
}
/* Reducer */
function reducer(state = { id: null }, action) {
    if (action.type === "EDIT") {
        return Object.assign(Object.assign({}, state), { id: action.id });
    }
    else {
        return state;
    }
}
