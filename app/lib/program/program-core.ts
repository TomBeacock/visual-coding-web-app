import { Category, ConstantDefinition, ConstantVarType, CoreFunctionDefinition } from "./program-data";

const constantDefBase: Pick<ConstantDefinition, "type"> = { type: "constant" };

export const constantDefinitions = new Map<ConstantVarType, ConstantDefinition>([
    ["boolean", {
        ...constantDefBase,
        varType: "boolean",
        icon: "boolean",
        widthOverride: 2,
    }],
    ["number", {
        ...constantDefBase,
        varType: "number",
        icon: "number",
        widthOverride: 4,
    }],
    ["string", {
        ...constantDefBase,
        varType: "string",
        icon: "string",
    }]
]);

const coreFunctionDefBase: Pick<CoreFunctionDefinition, "type"> = {
    type: "coreFunction",
}

const unaryDef: Pick<CoreFunctionDefinition, "widthOverride"> = {
    widthOverride: 4,
}

const binaryDef: Pick<CoreFunctionDefinition, "widthOverride"> = {
    widthOverride: 4,
}

type BaseDef = Pick<CoreFunctionDefinition, "type" | "category" | "outputs">;
type PartialDef = Pick<CoreFunctionDefinition, "type" | "category" | "inputs" | "outputs" | "widthOverride">;

const arithmeticDefBase: BaseDef = {
    ...coreFunctionDefBase,
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
    ...coreFunctionDefBase,
    ...binaryDef,
    category: "relational",
    inputs: [["a", "number"], ["b", "number"]],
    outputs: [["result", "boolean"]],
}

const logicalDefBase: BaseDef = {
    ...coreFunctionDefBase,
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
    ...coreFunctionDefBase,
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

const controlFlowDef: Pick<CoreFunctionDefinition, "type" | "category" | "widthOverride"> = {
    ...coreFunctionDefBase,
    category: "controlFlow",
    widthOverride: 5,
}

export const coreFunctionDefinitions = new Map<string, CoreFunctionDefinition>([
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
    }],
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

export const coreCategories = new Map<string, Category>([
    ["constant", { name: "constant", icon: "variable" }],
    ["controlFlow", { name: "controlFlow", icon: "branch" }],
    ["arithmetic", { name: "arithmetic", icon: "math" }],
    ["relational", { name: "relational", icon: "lessEqual" }],
    ["logic", { name: "logic", icon: "and" }],
    ["bitwise", { name: "bitwise", icon: "binary" }],
]);
