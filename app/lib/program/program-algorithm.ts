import { v7 as uuid } from "uuid";
import { Node, NodeDefinition, Pin, Program, TypedPin } from "./program-data";
import { std } from "./program-std";

export function pinEqual(a: TypedPin, b: TypedPin) {
    return a.nodeId === b.nodeId && a.index === b.index && a.type === b.type;
}

export function findDefinition(node: Node): NodeDefinition | undefined {
    if(node.type === "constant") {
        return std.get(typeof node.value);
    }
    else {
        if (node.lib === "std") {
            return std.get(node.func);
        }
    }
    return undefined;
}

export function addNode(program: Program, functionName: string, node: Node) {
    const f = program.functions.get(functionName);
    if (f !== undefined) {
        node.id = uuid();
        f.nodes.push(node);
    }
}

export function addLink(program: Program, functionName: string, src: Pin, dst: Pin) {
    const f = program.functions.get(functionName);
    if (f !== undefined) {
        f.links.push({ src, dst });
    }
}

export function removePinLinks(program: Program, functionName: string, pin: TypedPin) {
    const f = program.functions.get(functionName);
    if (f !== undefined) {
        let i = f.links.length;
        while (i--) {
            if (pinEqual({ ...f.links[i].src, type: "output" }, pin) ||
                pinEqual({ ...f.links[i].dst, type: "input" }, pin)) {
                f.links.splice(i, 1);
            }
        }
    }
}