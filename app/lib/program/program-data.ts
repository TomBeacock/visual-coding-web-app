export type Program = {
    functions: Map<string, Function>,
}

export type Function = {
    nodes: Node[],
    links: Link[],
}

export type Node = FunctionNode | ConstantNode;

export type NodeBase = {
    id: string,
    x: number,
    y: number,
}

export type ConstantNode = NodeBase & {
    type: "constant",
    value: boolean | number | string;
}

export type FunctionNode = NodeBase & {
    type: "function",
    lib: string,
    func: string,
}

export type Link = {
    src: Pin,
    dst: Pin,
}

export type Pin = {
    nodeId: string,
    index: number,
}

export type PinType = "input" | "output";

export type TypedPin = {
    type: PinType,
} & Pin;

export type NodeDefinition = {
    name: string,
    category: string,
    icon: string,
    widthOverride?: number,
    inputs: Map<string, VariableType>;
    outputs: Map<string, VariableType>;
}

export type Category = {
    name: string,
    icon: string,
}

export type VariableType = "exec" | "boolean" | "number" | "string" | "object";