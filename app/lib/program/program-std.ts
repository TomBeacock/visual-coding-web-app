import { NodeDefinition } from "./program-data";

const ifNode: NodeDefinition = {
    name: "if",
    inputs: new Map([["", "exec"], ["Condition", "boolean"]]),
    outputs: new Map([["True", "exec"],["False", "exec"]]),
} 

const addNode: NodeDefinition = {
    name: "add",
    inputs: new Map([["A", "number"], ["B", "number"]]),
    outputs: new Map([["Result", "number"]]),
}

export const std = new Map<string, NodeDefinition>([
    ["if", ifNode],
    ["add", addNode],
]);
