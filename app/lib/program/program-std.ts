import { Category, NodeDefinition } from "./program-data";

const boolNode: NodeDefinition = {
    name: "boolean",
    category: "constant",
    icon: "boolean",
    widthOverride: 2,
    inputs: new Map(),
    outputs: new Map([["", "boolean"]]),
}

const numberNode: NodeDefinition = {
    name: "number",
    category: "constant",
    icon: "number",
    widthOverride: 4,
    inputs: new Map(),
    outputs: new Map([["", "number"]]),
}

const stringNode: NodeDefinition = {
    name: "string",
    category: "constant",
    icon: "string",
    inputs: new Map(),
    outputs: new Map([["", "string"]]),
}

const ifNode: NodeDefinition = {
    name: "if",
    category: "flowControl",
    icon: "branch",
    widthOverride: 5,
    inputs: new Map([["", "exec"], ["condition", "boolean"]]),
    outputs: new Map([["true", "exec"], ["false", "exec"]]),
}

const whileNode: NodeDefinition = {
    name: "while",
    category: "flowControl",
    icon: "loop",
    widthOverride: 5,
    inputs: new Map([["", "exec"], ["condition", "boolean"]]),
    outputs: new Map([["completed", "exec"], ["body", "exec"]]),
}

const addNode: NodeDefinition = {
    name: "add",
    category: "math",
    icon: "add",
    widthOverride: 4,
    inputs: new Map([["a", "number"], ["b", "number"]]),
    outputs: new Map([["result", "number"]]),
}

const subNode: NodeDefinition = {
    name: "subtract",
    category: "math",
    icon: "subtract",
    widthOverride: 4,
    inputs: new Map([["a", "number"], ["b", "number"]]),
    outputs: new Map([["result", "number"]]),
}

const mulNode: NodeDefinition = {
    name: "multiply",
    category: "math",
    icon: "multiply",
    widthOverride: 4,
    inputs: new Map([["a", "number"], ["b", "number"]]),
    outputs: new Map([["result", "number"]]),
}

const divNode: NodeDefinition = {
    name: "divide",
    category: "math",
    icon: "divide",
    widthOverride: 4,
    inputs: new Map([["a", "number"], ["b", "number"]]),
    outputs: new Map([["result", "number"]]),
}

const andNode: NodeDefinition = {
    name: "and",
    category: "logic",
    icon: "and",
    widthOverride: 4,
    inputs: new Map([["a", "boolean"], ["b", "boolean"]]),
    outputs: new Map([["result", "boolean"]]),
}

const orNode: NodeDefinition = {
    name: "or",
    category: "logic",
    icon: "or",
    widthOverride: 4,
    inputs: new Map([["a", "boolean"], ["b", "boolean"]]),
    outputs: new Map([["result", "boolean"]]),
}

const notNode: NodeDefinition = {
    name: "not",
    category: "logic",
    icon: "not",
    widthOverride: 4,
    inputs: new Map([["a", "boolean"]]),
    outputs: new Map([["result", "boolean"]]),
}

const equalNode: NodeDefinition = {
    name: "equal",
    category: "logic",
    icon: "equal",
    widthOverride: 4,
    inputs: new Map([["a", "number"], ["b", "number"]]),
    outputs: new Map([["result", "boolean"]]),
}

const notEqualNode: NodeDefinition = {
    name: "notEqual",
    category: "logic",
    icon: "notEqual",
    inputs: new Map([["a", "number"], ["b", "number"]]),
    outputs: new Map([["result", "boolean"]]),
}

const lessNode: NodeDefinition = {
    name: "lessThan",
    category: "logic",
    icon: "less",
    widthOverride: 4,
    inputs: new Map([["a", "number"], ["b", "number"]]),
    outputs: new Map([["result", "boolean"]]),
}

const lessEqualNode: NodeDefinition = {
    name: "lessThanOrEqualTo",
    category: "logic",
    icon: "lessEqual",
    widthOverride: 4,
    inputs: new Map([["a", "number"], ["b", "number"]]),
    outputs: new Map([["result", "boolean"]]),
}

const greaterNode: NodeDefinition = {
    name: "greaterThan",
    category: "logic",
    icon: "greater",
    widthOverride: 4,
    inputs: new Map([["a", "number"], ["b", "number"]]),
    outputs: new Map([["result", "boolean"]]),
}

const greaterEqualNode: NodeDefinition = {
    name: "greaterThanOrEqualTo",
    category: "logic",
    icon: "greaterEqual",
    widthOverride: 4,
    inputs: new Map([["a", "number"], ["b", "number"]]),
    outputs: new Map([["result", "boolean"]]),
}

export const std = new Map<string, NodeDefinition>([
    ["boolean", boolNode],
    ["number", numberNode],
    ["string", stringNode],
    ["if", ifNode],
    ["while", whileNode],
    ["add", addNode],
    ["subtract", subNode],
    ["multiply", mulNode],
    ["divide", divNode],
    ["and", andNode],
    ["or", orNode],
    ["not", notNode],
    ["equal", equalNode],
    ["notEqual", notEqualNode],
    ["lessThan", lessNode],
    ["lessThanOrEqualTo", lessEqualNode],
    ["greaterThan", greaterNode],
    ["greaterThanOrEqualTo", greaterEqualNode],
]);

export const stdCategories = new Map<string, Category>([
    ["constant", { name: "constant", icon: "variable" }],
    ["flowControl", { name: "flowControl", icon: "branch" }],
    ["math", { name: "math", icon: "math" }],
    ["logic", { name: "logic", icon: "and" }],
]);
