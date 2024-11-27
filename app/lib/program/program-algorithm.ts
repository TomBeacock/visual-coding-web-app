import { v7 as uuid } from "uuid";
import { ConstantNode, ControlFlow, Node, NodeDefinition, Operation, Pin, Program, TypedPin } from "./program-data";
import { constantDefinitions, operationDefinitions, controlFlowDefinitions } from "./program-core";
import { Vector2 } from "../vector2";

export function pinEqual(a: TypedPin, b: TypedPin) {
    return a.nodeId === b.nodeId && a.index === b.index && a.type === b.type;
}

export function findDefinition(node: Node): NodeDefinition | undefined {
    switch (node.type) {
        case "constant":
            return constantDefinitions.get(typeof node.value as "boolean" | "number" | "string");
        case "operation":
            return operationDefinitions.get(node.operation);
        case "controlFlow":
            return controlFlowDefinitions.get(node.controlFlow);
    }
    return undefined;
}

export function createNode(def: NodeDefinition, x: number, y: number): Node {
    const base: Pick<Node, "id" | "x" | "y"> = { id: uuid(), x, y };
    switch (def.type) {
        case "constant": {
            const constantBase: Pick<ConstantNode, "id" | "x" | "y" | "type"> =
                { ...base, type: "constant" };
            switch (def.name) {
                case "boolean": return { ...constantBase, value: false };
                case "number": return { ...constantBase, value: 0 };
                case "string": return { ...constantBase, value: "" };
            }
            break;
        }
        case "operation": {
            return { ...base, type: "operation", operation: def.name as Operation };
        }
        case "controlFlow": {
            return { ...base, type: "controlFlow", controlFlow: def.name as ControlFlow };
        }
    }
    return { ...base, type: "function", funcName: "" };
}

export function addNode(program: Program, functionName: string, node: Node) {
    const f = program.functions.get(functionName);
    if (f !== undefined) {
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

export function addFunction(program: Program, name: string) {
    while (program.functions.has(name)) {
        name += "Copy";
    }
    program.functions.set(name, {
        position: Vector2.zero(),
        scale: 1,
        nodes: [],
        links: [],
    });
    return name;
}

export function deleteFunction(program: Program, name: string) {
    if (name === "main") {
        return;
    }
    program.functions.delete(name);
}