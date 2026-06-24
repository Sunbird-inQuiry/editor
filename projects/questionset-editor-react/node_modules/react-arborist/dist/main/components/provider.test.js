"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_2 = require("@testing-library/react");
const react_window_1 = require("react-window");
const tree_1 = require("./tree");
const data = [
    {
        id: "1",
        name: "root",
        children: [
            { id: "2", name: "a" },
            { id: "3", name: "b", children: [{ id: "4", name: "c" }] },
        ],
    },
];
test("imperative tree.update() props survive node toggles (#228)", () => {
    const ref = (0, react_1.createRef)();
    (0, react_2.render)((0, jsx_runtime_1.jsx)(tree_1.Tree, { data: data, ref: ref, rowHeight: 24, openByDefault: false }));
    const api = ref.current;
    expect(api.rowHeight).toBe(24);
    (0, react_2.act)(() => {
        api.update(Object.assign(Object.assign({}, api.props), { rowHeight: 48 }));
    });
    expect(api.rowHeight).toBe(48);
    /* Opening a node dispatches a redux action that changes state.nodes.open.
       Before #337, the open-state effect re-ran api.update(treeProps), reverting
       rowHeight to 24. */
    (0, react_2.act)(() => {
        api.open("1");
    });
    expect(api.rowHeight).toBe(48);
});
/* Backwards compatibility: switching FixedSizeList -> VariableSizeList must not
   change layout for a numeric rowHeight. With openByDefault, all four nodes
   (1 > 2, 3 > 4) are visible in DFS order. */
test("numeric rowHeight positions rows at index * height (#238 back-compat)", () => {
    (0, react_2.render)((0, jsx_runtime_1.jsx)(tree_1.Tree, { data: data, rowHeight: 24, openByDefault: true }));
    const rows = react_2.screen.getAllByRole("treeitem");
    expect(rows).toHaveLength(4);
    rows.forEach((row, i) => {
        expect(row.style.height).toBe("24px");
        expect(row.style.top).toBe(`${i * 24}px`);
    });
});
test("function rowHeight gives each row its own height and cumulative top (#238)", () => {
    const heights = { "1": 40, "2": 20, "3": 30, "4": 10 };
    (0, react_2.render)((0, jsx_runtime_1.jsx)(tree_1.Tree, { data: data, rowHeight: (node) => heights[node.id], openByDefault: true }));
    const rows = react_2.screen.getAllByRole("treeitem");
    expect(rows).toHaveLength(4);
    const expected = [40, 20, 30, 10];
    let top = 0;
    rows.forEach((row, i) => {
        expect(row.style.height).toBe(`${expected[i]}px`);
        expect(row.style.top).toBe(`${top}px`);
        top += expected[i];
    });
});
test("mutations tell the list to recompute heights (#238)", () => {
    const ref = (0, react_1.createRef)();
    /* Only variable-height mode renders a VariableSizeList with a measurement
       cache to recompute, so use a function rowHeight here. */
    (0, react_2.render)((0, jsx_runtime_1.jsx)(tree_1.Tree, { data: data, ref: ref, rowHeight: () => 24, openByDefault: true }));
    const api = ref.current;
    const reset = jest.spyOn(api.list.current, "resetAfterIndex");
    (0, react_2.act)(() => api.close("1"));
    expect(reset).toHaveBeenCalled();
    reset.mockClear();
    (0, react_2.act)(() => api.open("1"));
    expect(reset).toHaveBeenCalled();
});
/* react-window caches measurements by index and never invalidates them itself.
   When data changes via props in variable-height mode, those cached sizes belong
   to the wrong rows, so update() must drop the cache. It runs during render, so
   it uses the shouldForceUpdate=false variant. */
test("changing data in variable-height mode resets the list cache (#238)", () => {
    const ref = (0, react_1.createRef)();
    const rowHeight = (node) => (node.isInternal ? 40 : 20);
    const { rerender } = (0, react_2.render)((0, jsx_runtime_1.jsx)(tree_1.Tree, { data: data, ref: ref, rowHeight: rowHeight, openByDefault: true }));
    const reset = jest.spyOn(ref.current.list.current, "resetAfterIndex");
    const nextData = [{ id: "9", name: "fresh" }, ...data];
    (0, react_2.act)(() => {
        rerender((0, jsx_runtime_1.jsx)(tree_1.Tree, { data: nextData, ref: ref, rowHeight: rowHeight, openByDefault: true }));
    });
    expect(reset).toHaveBeenCalledWith(0, false);
});
/* The numeric path must stay on FixedSizeList: it has constant item sizes, so
   there is no measurement cache to go stale and none of VariableSizeList's
   overhead. A FixedSizeList has no resetAfterIndex method at all. */
test("numeric rowHeight renders a cache-free FixedSizeList (#238)", () => {
    const ref = (0, react_1.createRef)();
    (0, react_2.render)((0, jsx_runtime_1.jsx)(tree_1.Tree, { data: data, ref: ref, rowHeight: 24, openByDefault: true }));
    const list = ref.current.list.current;
    expect(list).toBeInstanceOf(react_window_1.FixedSizeList);
    expect("resetAfterIndex" in list).toBe(false);
});
/* The function path uses VariableSizeList so per-row heights are possible. */
test("function rowHeight renders a VariableSizeList (#238)", () => {
    const ref = (0, react_1.createRef)();
    (0, react_2.render)((0, jsx_runtime_1.jsx)(tree_1.Tree, { data: data, ref: ref, rowHeight: () => 24, openByDefault: true }));
    expect(ref.current.list.current).toBeInstanceOf(react_window_1.VariableSizeList);
});
