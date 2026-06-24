export type EditState = {
    id: string | null;
};
export declare function edit(id: string | null): {
    type: "EDIT";
    id: string | null;
};
export declare function reducer(state: EditState | undefined, action: ReturnType<typeof edit>): EditState;
