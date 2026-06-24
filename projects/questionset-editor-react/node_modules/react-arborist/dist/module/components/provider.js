import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim";
import { DataUpdatesContext, DndContext, NodesContext, TreeApiContext } from "../context";
import { TreeApi } from "../interfaces/tree-api";
import { initialState } from "../state/initial";
import { rootReducer } from "../state/root-reducer";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import { createStore } from "redux";
import { actions as visibility } from "../state/open-slice";
const SERVER_STATE = initialState();
export function TreeProvider({ treeProps, imperativeHandle, children }) {
    const list = useRef(null);
    const listEl = useRef(null);
    const store = useRef(
    // @ts-ignore
    createStore(rootReducer, initialState(treeProps)));
    const state = useSyncExternalStore(store.current.subscribe, store.current.getState, () => SERVER_STATE);
    /* The tree api object is stable. */
    const api = useMemo(() => {
        return new TreeApi(store.current, treeProps, list, listEl);
    }, []);
    /* Make sure the tree instance stays in sync */
    const updateCount = useRef(0);
    useMemo(() => {
        updateCount.current += 1;
        api.update(treeProps);
    }, Object.values(treeProps));
    /* Rebuild visible nodes when open state changes, without clobbering
       props set imperatively via api.update(). Bumping updateCount keeps
       DataUpdates consumers (e.g. DefaultContainer) in sync. */
    useMemo(() => {
        updateCount.current += 1;
        api.update(api.props);
    }, [state.nodes.open]);
    /* Expose the tree api */
    useImperativeHandle(imperativeHandle, () => api);
    /* Change selection based on props */
    useEffect(() => {
        if (api.props.selection) {
            api.select(api.props.selection, { focus: false });
        }
        else {
            api.deselectAll();
        }
    }, [api.props.selection]);
    /* Clear visability for filtered nodes */
    useEffect(() => {
        if (!api.props.searchTerm) {
            store.current.dispatch(visibility.clear(true));
        }
    }, [api.props.searchTerm]);
    return (_jsx(TreeApiContext.Provider, { value: api, children: _jsx(DataUpdatesContext.Provider, { value: updateCount.current, children: _jsx(NodesContext.Provider, { value: state.nodes, children: _jsx(DndContext.Provider, { value: state.dnd, children: _jsx(DndProvider, Object.assign({}, (treeProps.dndManager
                        ? { manager: treeProps.dndManager }
                        : {
                            backend: treeProps.dndBackend || HTML5Backend,
                            options: {
                                rootElement: api.props.dndRootElement || undefined,
                            },
                        }), { children: children })) }) }) }) }));
}
