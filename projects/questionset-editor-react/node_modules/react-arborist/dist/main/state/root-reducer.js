"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rootReducer = void 0;
const redux_1 = require("redux");
const focus_slice_1 = require("./focus-slice");
const edit_slice_1 = require("./edit-slice");
const dnd_slice_1 = require("./dnd-slice");
const selection_slice_1 = require("./selection-slice");
const open_slice_1 = require("./open-slice");
const drag_slice_1 = require("./drag-slice");
exports.rootReducer = (0, redux_1.combineReducers)({
    nodes: (0, redux_1.combineReducers)({
        focus: focus_slice_1.reducer,
        edit: edit_slice_1.reducer,
        open: open_slice_1.reducer,
        selection: selection_slice_1.reducer,
        drag: drag_slice_1.reducer,
    }),
    dnd: dnd_slice_1.reducer,
});
