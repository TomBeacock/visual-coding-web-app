import { Category, ControlFlow, NodeDefinition, Operation } from "./program-data";

const constantDef: Pick<NodeDefinition, "type" | "category" | "inputs"> = {
    type: "constant",
    category: "constant",
    inputs: [],
}

export const constantDefinitions = new Map<"boolean" | "number" | "string", NodeDefinition>([
    ["boolean", {
        ...constantDef,
        name: "boolean",
        icon: "boolean",
        widthOverride: 2,
        outputs: [["", "boolean"]],
    }],
    ["number", {
        ...constantDef,
        name: "number",
        icon: "number",
        widthOverride: 4,
        outputs: [["", "number"]],
    }],
    ["string", {
        ...constantDef,
        name: "string",
        icon: "string",
        outputs: [["", "string"]],
    }]
]);

const unaryDef: Pick<NodeDefinition, "widthOverride"> = {
    widthOverride: 4,
}

const binaryDef: Pick<NodeDefinition, "widthOverride"> = {
    widthOverride: 4,
}

type BaseDef = Pick<NodeDefinition, "type" | "category" | "outputs">;
type PartialDef = Pick<NodeDefinition, "type" | "category" | "inputs" | "outputs" | "widthOverride">;

const arithmeticDefBase: BaseDef = {
    type: "operation",
    category: "arithmetic",
    outputs: [["result", "number"]],
}

const unaryArithmeticDef: PartialDef = {
    ...arithmeticDefBase,
    ...unaryDef,
    inputs: [["a", "number"]],
}

const binaryArithmeticDef: PartialDef = {
    ...arithmeticDefBase,
    ...binaryDef,
    inputs: [["a", "number"], ["b", "number"]],
}

const relationalDef: PartialDef = {
    ...binaryDef,
    type: "operation",
    category: "relational",
    inputs: [["a", "number"], ["b", "number"]],
    outputs: [["result", "boolean"]],
}

const logicalDefBase: BaseDef = {
    type: "operation",
    category: "logic",
    outputs: [["result", "boolean"]]
}

const unaryLogicalDef: PartialDef = {
    ...logicalDefBase,
    ...unaryDef,
    inputs: [["a", "boolean"]],
}

const binaryLogicalDef: PartialDef = {
    ...logicalDefBase,
    ...binaryDef,
    inputs: [["a", "boolean"], ["b", "boolean"]],
}

const bitwiseDefBase: BaseDef = {
    type: "operation",
    category: "bitwise",
    outputs: [["result", "number"]]
}

const unaryBitwiseDef: PartialDef = {
    ...bitwiseDefBase,
    ...unaryDef,
    inputs: [["a", "number"]],
}

const binaryBitwiseDef: PartialDef = {
    ...bitwiseDefBase,
    ...binaryDef,
    inputs: [["a", "number"], ["b", "number"]],
}

export const operationDefinitions = new Map<Operation, NodeDefinition>([
    ["add", { ...binaryArithmeticDef, name: "add", icon: "plus" }],
    ["subtract", { ...binaryArithmeticDef, name: "subtract", icon: "minus" }],
    ["multiply", { ...binaryArithmeticDef, name: "multiply", icon: "cross" }],
    ["divide", { ...binaryArithmeticDef, name: "divide", icon: "divide" }],
    ["negate", { ...unaryArithmeticDef, name: "negate", icon: "minus" }],
    ["modulo", { ...binaryArithmeticDef, name: "modulo", icon: "percentage" }],
    ["increment", { ...unaryArithmeticDef, name: "increment", icon: "increment" }],
    ["decrement", { ...unaryArithmeticDef, name: "decrement", icon: "decrement" }],
    ["equal", { ...relationalDef, name: "equal", icon: "equal" }],
    ["notEqual", { ...relationalDef, name: "notEqual", icon: "notEqual" }],
    ["less", { ...relationalDef, name: "less", icon: "less" }],
    ["lessOrEqual", { ...relationalDef, name: "lessOrEqual", icon: "lessEqual" }],
    ["greater", { ...relationalDef, name: "greater", icon: "greater" }],
    ["greaterOrEqual", { ...relationalDef, name: "greaterOrEqual", icon: "greaterEqual" }],
    ["logicalNot", { ...unaryLogicalDef, name: "logicalNot", icon: "not" }],
    ["logicalAnd", { ...binaryLogicalDef, name: "logicalAnd", icon: "and" }],
    ["logicalOr", { ...unaryLogicalDef, name: "logicalOr", icon: "or" }],
    ["not", { ...unaryBitwiseDef, name: "not", icon: "not" }],
    ["and", { ...binaryBitwiseDef, name: "and", icon: "and" }],
    ["or", { ...binaryBitwiseDef, name: "or", icon: "or" }],
    ["xor", { ...binaryBitwiseDef, name: "xor", icon: "xor" }],
    ["leftShift", { ...binaryBitwiseDef, name: "leftShift", icon: "leftShift" }],
    ["rightShift", { ...binaryBitwiseDef, name: "rightShift", icon: "rightShift" }],
]);

const controlFlowDef: Pick<NodeDefinition, "type" | "category" | "widthOverride"> = {
    type: "controlFlow",
    category: "controlFlow",
    widthOverride: 5,
}

export const controlFlowDefinitions = new Map<ControlFlow, NodeDefinition>([
    ["if", {
        ...controlFlowDef,
        name: "if",
        icon: "branch",
        inputs: [["", "exec"], ["condition", "boolean"]],
        outputs: [["true", "exec"], ["false", "exec"]],
    }],
    ["while", {
        ...controlFlowDef,
        name: "while",
        icon: "loop",
        inputs: [["", "exec"], ["condition", "boolean"]],
        outputs: [["completed", "exec"], ["body", "exec"]],
    }]
]);

export const coreCategories = new Map<string, Category>([
    ["constant", { name: "constant", icon: "variable" }],
    ["controlFlow", { name: "controlFlow", icon: "branch" }],
    ["arithmetic", { name: "arithmetic", icon: "math" }],
    ["relational", { name: "relational", icon: "lessEqual" }],
    ["logic", { name: "logic", icon: "and" }],
    ["bitwise", { name: "bitwise", icon: "binary" }],
]);
