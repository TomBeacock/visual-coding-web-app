import { Node, NodeDefinition, Pin, Program, TypedPin, VariableType } from "./program-data";
import { std } from "./program-std";

export function pinEqual(a: TypedPin, b: TypedPin) {
    return a.nodeId === b.nodeId && a.index === b.index && a.type === b.type;
}

export function findDefinition(node: Node): NodeDefinition | undefined {
    if (node.lib === "std") {
        return std.get(node.func);
    }
    return undefined;
}

export function getVariableTypeColor(varType: VariableType) {
    return `var(--type-${varType}-color)`;
}

export function addLink(program: Program, functionName: string, src: Pin, dst: Pin) {
    const func = program.functions.get(functionName);
    if (func !== undefined) {
        func.links.push({ src, dst });
    }
}

export function removePinLinks(program: Program, functionName: string, pin: TypedPin) {
    const func = program.functions.get(functionName);
    if (func !== undefined) {
        let i = func.links.length;
        while (i--) {
            if (pinEqual({ ...func.links[i].src, type: "output" }, pin) ||
                pinEqual({ ...func.links[i].dst, type: "input" }, pin)) {
                func.links.splice(i, 1);
            }
        }
    }
}