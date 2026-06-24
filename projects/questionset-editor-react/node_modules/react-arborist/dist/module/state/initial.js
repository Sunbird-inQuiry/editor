export const initialState = (props) => {
    var _a;
    return ({
        nodes: {
            // Changes together
            open: { filtered: {}, unfiltered: (_a = props === null || props === void 0 ? void 0 : props.initialOpenState) !== null && _a !== void 0 ? _a : {} },
            focus: { id: null, treeFocused: false },
            edit: { id: null },
            drag: {
                id: null,
                selectedIds: [],
                destinationParentId: null,
                destinationIndex: null,
            },
            selection: { ids: new Set(), anchor: null, mostRecent: null },
        },
        dnd: {
            cursor: { type: "none" },
            dragId: null,
            dragIds: [],
            parentId: null,
            index: -1,
        },
    });
};
