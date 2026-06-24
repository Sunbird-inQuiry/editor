import { initialState } from "./initial";
/* Actions */
export const actions = {
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
export function reducer(state = initialState()["dnd"], action) {
    switch (action.type) {
        case "DND_CURSOR":
            return Object.assign(Object.assign({}, state), { cursor: action.cursor });
        case "DND_DRAG_START":
            return Object.assign(Object.assign({}, state), { dragId: action.id, dragIds: action.dragIds });
        case "DND_DRAG_END":
            return initialState()["dnd"];
        case "DND_HOVERING":
            return Object.assign(Object.assign({}, state), { parentId: action.parentId, index: action.index });
        default:
            return state;
    }
}
