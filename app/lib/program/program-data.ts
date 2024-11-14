export type Program = {
    functions: Map<string, Function>,
}

export type Function = {
    nodes: Node[],
    links: Link[],
}

export type Node = {
    id: number,
    lib: string,
    func: string,
    x: number,
    y: number,
}

export type Link = {
    src: Pin,
    dst: Pin,
}

export type Pin = {
    nodeId: number,
    index: number,
}

export type NodeDefinition = {
    name: string,
    inputs: Map<string, VariableType>;
    outputs: Map<string, VariableType>;
}

export type VariableType = "exec" | "boolean" | "number" | "string" | "object";