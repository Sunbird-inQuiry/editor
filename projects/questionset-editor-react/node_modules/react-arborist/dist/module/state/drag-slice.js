import { initialState } from "./initial";
/* Reducer */
export function reducer(state = initialState().nodes.drag, action) {
    switch (action.type) {
        case "DND_DRAG_START":
            return Object.assign(Object.assign({}, state), { id: action.id, selectedIds: action.dragIds });
        case "DND_DRAG_END":
            return Object.assign(Object.assign({}, state), { id: null, destinationParentId: null, destinationIndex: null, selectedIds: [] });
        case "DND_HOVERING":
            if (action.parentId !== state.destinationParentId || action.index != state.destinationIndex) {
                return Object.assign(Object.assign({}, state), { destinationParentId: action.parentId, destinationIndex: action.index });
            }
            else {
                return state;
            }
        default:
            return state;
    }
}
