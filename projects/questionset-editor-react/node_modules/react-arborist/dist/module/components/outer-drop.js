import { useOuterDrop } from "../dnd/outer-drop-hook";
export function OuterDrop(props) {
    useOuterDrop();
    return props.children;
}
