import { Vector2 } from "../vector2";

export type Program = {
    functions: Map<string, Function>,
}

export type Function = {
    position: Vector2,
    scale: number,
    nodes: Node[],
    links: Link[],
}

export type Node = ConstantNode | OperationNode | ControlFlowNode | VariableNode | FunctionNode;

export type NodeBase = {
    id: string,
    x: number,
    y: number,
}

export type ConstantNode = NodeBase & {
    type: "constant",
    value: boolean | number | string;
}

export type Operation =
    "add" | "subtract" | "multiply" | "divide" | "negate" | "modulo" | "increment" | "decrement" | // Arithmetic
    "equal" | "notEqual" | "less" | "lessOrEqual" | "greater" | "greaterOrEqual" | // Comparison/relational
    "logicalNot" | "logicalAnd" | "logicalOr" | // Logical
    "not" | "and" | "or" | "xor" | "leftShift" | "rightShift"; // Bitwise

export type OperationNode = NodeBase & {
    type: "operation",
    operation: Operation,
}

export type ControlFlow = "if" | "while"

export type ControlFlowNode = NodeBase & {
    type: "controlFlow",
    controlFlow: ControlFlow,
}

export type VariableNode = NodeBase & {
    type: "variable",
    operation: "get" | "set",
    varName: string,
}

export type FunctionNode = NodeBase & {
    type: "function",
    funcName: string,
}

export type Link = {
    src: Pin,
    dst: Pin,
}

export type Pin = {
    nodeId: string,
    index: number,
}

export type PinType = "input" | "output"

export type TypedPin = {
    type: PinType,
} & Pin

export type NodeDefinition = {
    name: string,
    type: "constant" | "operation" | "controlFlow" | "variable" | "function",
    category: string,
    icon: string,
    widthOverride?: number,
    inputs: [string, VariableType][];
    outputs: [string, VariableType][];
}

export type Category = {
    name: string,
    icon: string,
}

export type VariableType = "exec" | "boolean" | "number" | "string" | "object"