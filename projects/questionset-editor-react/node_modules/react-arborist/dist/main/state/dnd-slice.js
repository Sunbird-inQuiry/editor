"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actions = void 0;
exports.reducer = reducer;
const initial_1 = require("./initial");
/* Actions */
exports.actions = {
    cursor(cursor) {
        return { type: "DND_CURSOR", cursor };
    },
    dragStart(id, dragIds) {
        return { type: "DND_DRAG_START", id, dragIds };
    },
    dragEnd() {
        return { type: "DND_DRAG_END" };
    },
    hovering(parentId, index) {
        return { type: "DND_HOVERING", parentId, index };
    },
};
/* Reducer */
function reducer(state = (0, initial_1.initialState)()["dnd"], action) {
    switch (action.type) {
        case "DND_CURSOR":
            return Object.assign(Object.assign({}, state), { cursor: action.cursor });
        case "DND_DRAG_START":
            return Object.assign(Object.assign({}, state), { dragId: action.id, dragIds: action.dragIds });
        case "DND_DRAG_END":
            return (0, initial_1.initialState)()["dnd"];
        case "DND_HOVERING":
            return Object.assign(Object.assign({}, state), { parentId: action.parentId, index: action.index });
        default:
            return state;
    }
}
