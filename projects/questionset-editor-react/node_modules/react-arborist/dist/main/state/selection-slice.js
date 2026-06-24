"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actions = void 0;
exports.reducer = reducer;
const utils_1 = require("../utils");
const initial_1 = require("./initial");
/* Actions */
exports.actions = {
    clear: () => ({ type: "SELECTION_CLEAR" }),
    only: (id) => ({
        type: "SELECTION_ONLY",
        id: (0, utils_1.identify)(id),
    }),
    add: (id) => ({
        type: "SELECTION_ADD",
        ids: (Array.isArray(id) ? id : [id]).map(utils_1.identify),
    }),
    remove: (id) => ({
        type: "SELECTION_REMOVE",
        ids: (Array.isArray(id) ? id : [id]).map(utils_1.identify),
    }),
    set: (args) => (Object.assign({ type: "SELECTION_SET" }, args)),
    mostRecent: (id) => ({
        type: "SELECTION_MOST_RECENT",
        id: id === null ? null : (0, utils_1.identify)(id),
    }),
    anchor: (id) => ({
        type: "SELECTION_ANCHOR",
        id: id === null ? null : (0, utils_1.identify)(id),
    }),
};
/* Reducer */
function reducer(state = (0, initial_1.initialState)()["nodes"]["selection"], action) {
    const ids = state.ids;
    switch (action.type) {
        case "SELECTION_CLEAR":
            return Object.assign(Object.assign({}, state), { ids: new Set() });
        case "SELECTION_ONLY":
            return Object.assign(Object.assign({}, state), { ids: new Set([action.id]) });
        case "SELECTION_ADD":
            if (action.ids.length === 0)
                return state;
            action.ids.forEach((id) => ids.add(id));
            return Object.assign(Object.assign({}, state), { ids: new Set(ids) });
        case "SELECTION_REMOVE":
            if (action.ids.length === 0)
                return state;
            action.ids.forEach((id) => ids.delete(id));
            return Object.assign(Object.assign({}, state), { ids: new Set(ids) });
        case "SELECTION_SET":
            return Object.assign(Object.assign({}, state), { ids: action.ids, mostRecent: action.mostRecent, anchor: action.anchor });
        case "SELECTION_MOST_RECENT":
            return Object.assign(Object.assign({}, state), { mostRecent: action.id });
        case "SELECTION_ANCHOR":
            return Object.assign(Object.assign({}, state), { anchor: action.id });
        default:
            return state;
    }
}
