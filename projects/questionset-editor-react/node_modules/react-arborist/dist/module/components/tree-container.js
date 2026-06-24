import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useTreeApi } from "../context";
import { DefaultContainer } from "./default-container";
export function TreeContainer() {
    const tree = useTreeApi();
    const Container = tree.props.renderContainer || DefaultContainer;
    return (_jsx(_Fragment, { children: _jsx(Container, {}) }));
}
