import { Vector2 } from "../vector2";

export type Program = {
    functions: Map<string, UserFunctionDefinition>,
}

export type NodeDefinition = ConstantDefinition | VariableDefinition | CoreFunctionDefinition | UserFunctionDefinition;

export type ConstantVarType = "boolean" | "number" | "string"
export type PinVarType = "exec" | ConstantVarType

export type ConstantDefinition = {
    type: "constant";
    varType: ConstantVarType,
    icon: string,
    widthOverride?: number,
}

export type VariableDefinition = {
    type: "variable",
    name: string,
    varType: ConstantVarType,
}

export type FunctionDefinition = {
    name: string,
    category?: string,
    icon?: string,
    widthOverride?: number,
    inputs: [string, PinVarType][];
    outputs: [string, PinVarType][];
}

export type CoreFunctionDefinition = FunctionDefinition & {
    type: "coreFunction";
}

export type UserFunctionDefinition = FunctionDefinition & {
    type: "userFunction";
    position: Vector2,
    scale: number,
    nodes: Node[],
    links: Link[],
    variables: Map<string, VariableDefinition>,
}

export type Node = FunctionNode | ConstantNode | VariableNode | CoreFunctionCallNode | UserFunctionCallNode;

export type NodeBase = {
    id: string,
    x: number,
    y: number,
}

export type FunctionNodeOperation = "entry" | "return"

export type FunctionNode = NodeBase & {
    type: "function",
    operation: FunctionNodeOperation;
}

export type ConstantNode = NodeBase & {
    type: "constant",
    varType: ConstantVarType,
    value: boolean | number | string;
}

export type VariableNodeOperation = "get" | "set"

export type VariableNode = NodeBase & {
    type: "variable",
    operation: VariableNodeOperation,
    varName: string,
}

export type CoreFunctionCallNode = NodeBase & {
    type: "coreFunctionCall",
    funcName: string,
}

export type UserFunctionCallNode = NodeBase & {
    type: "userFunctionCall",
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

export type Category = {
    name: string,
    icon: string,
}