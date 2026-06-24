/* Actions */
export const actions = {
    open(id, filtered) {
        return { type: "VISIBILITY_OPEN", id, filtered };
    },
    close(id, filtered) {
        return { type: "VISIBILITY_CLOSE", id, filtered };
    },
    toggle(id, filtered) {
        return { type: "VISIBILITY_TOGGLE", id, filtered };
    },
    clear(filtered) {
        return { type: "VISIBILITY_CLEAR", filtered };
    },
};
/* Reducer */
function openMapReducer(state = {}, action) {
    if (action.type === "VISIBILITY_OPEN") {
        return Object.assign(Object.assign({}, state), { [action.id]: true });
    }
    else if (action.type === "VISIBILITY_CLOSE") {
        return Object.assign(Object.assign({}, state), { [action.id]: false });
    }
    else if (action.type === "VISIBILITY_TOGGLE") {
        const prev = state[action.id];
        return Object.assign(Object.assign({}, state), { [action.id]: !prev });
    }
    else if (action.type === "VISIBILITY_CLEAR") {
        return {};
    }
    else {
        return state;
    }
}
export function reducer(state = { filtered: {}, unfiltered: {} }, action) {
    if (!action.type.startsWith("VISIBILITY"))
        return state;
    if (action.filtered) {
        return Object.assign(Object.assign({}, state), { filtered: openMapReducer(state.filtered, action) });
    }
    else {
        return Object.assign(Object.assign({}, state), { unfiltered: openMapReducer(state.unfiltered, action) });
    }
}
