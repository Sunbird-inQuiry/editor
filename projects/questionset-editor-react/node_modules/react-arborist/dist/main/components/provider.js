"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeProvider = TreeProvider;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const shim_1 = require("use-sync-external-store/shim");
const context_1 = require("../context");
const tree_api_1 = require("../interfaces/tree-api");
const initial_1 = require("../state/initial");
const root_reducer_1 = require("../state/root-reducer");
const react_dnd_html5_backend_1 = require("react-dnd-html5-backend");
const react_dnd_1 = require("react-dnd");
const redux_1 = require("redux");
const open_slice_1 = require("../state/open-slice");
const SERVER_STATE = (0, initial_1.initialState)();
function TreeProvider({ treeProps, imperativeHandle, children }) {
    const list = (0, react_1.useRef)(null);
    const listEl = (0, react_1.useRef)(null);
    const store = (0, react_1.useRef)(
    // @ts-ignore
    (0, redux_1.createStore)(root_reducer_1.rootReducer, (0, initial_1.initialState)(treeProps)));
    const state = (0, shim_1.useSyncExternalStore)(store.current.subscribe, store.current.getState, () => SERVER_STATE);
    /* The tree api object is stable. */
    const api = (0, react_1.useMemo)(() => {
        return new tree_api_1.TreeApi(store.current, treeProps, list, listEl);
    }, []);
    /* Make sure the tree instance stays in sync */
    const updateCount = (0, react_1.useRef)(0);
    (0, react_1.useMemo)(() => {
        updateCount.current += 1;
        api.update(treeProps);
    }, Object.values(treeProps));
    /* Rebuild visible nodes when open state changes, without clobbering
       props set imperatively via api.update(). Bumping updateCount keeps
       DataUpdates consumers (e.g. DefaultContainer) in sync. */
    (0, react_1.useMemo)(() => {
        updateCount.current += 1;
        api.update(api.props);
    }, [state.nodes.open]);
    /* Expose the tree api */
    (0, react_1.useImperativeHandle)(imperativeHandle, () => api);
    /* Change selection based on props */
    (0, react_1.useEffect)(() => {
        if (api.props.selection) {
            api.select(api.props.selection, { focus: false });
        }
        else {
            api.deselectAll();
        }
    }, [api.props.selection]);
    /* Clear visability for filtered nodes */
    (0, react_1.useEffect)(() => {
        if (!api.props.searchTerm) {
            store.current.dispatch(open_slice_1.actions.clear(true));
        }
    }, [api.props.searchTerm]);
    return ((0, jsx_runtime_1.jsx)(context_1.TreeApiContext.Provider, { value: api, children: (0, jsx_runtime_1.jsx)(context_1.DataUpdatesContext.Provider, { value: updateCount.current, children: (0, jsx_runtime_1.jsx)(context_1.NodesContext.Provider, { value: state.nodes, children: (0, jsx_runtime_1.jsx)(context_1.DndContext.Provider, { value: state.dnd, children: (0, jsx_runtime_1.jsx)(react_dnd_1.DndProvider, Object.assign({}, (treeProps.dndManager
                        ? { manager: treeProps.dndManager }
                        : {
                            backend: treeProps.dndBackend || react_dnd_html5_backend_1.HTML5Backend,
                            options: {
                                rootElement: api.props.dndRootElement || undefined,
                            },
                        }), { children: children })) }) }) }) }));
}
