import { v7 as uuid } from "uuid";
import {
    Program,
    NodeDefinition,
    CoreFunctionDefinition,
    Node,
    ConstantNode,
    FunctionNodeOperation,
    Pin,
    TypedPin,
    ConstantDefinition,
    ConstantVarType,
    UserFunctionDefinition,
    VariableDefinition,
} from "./program-data";
import { constantDefinitions, coreFunctionDefinitions } from "./program-core";
import { Vector2 } from "../vector2";

export function pinEqual(a: TypedPin, b: TypedPin) {
    return a.nodeId === b.nodeId && a.index === b.index && a.type === b.type;
}

export const defaultProgram = createProgram();

export function createProgram(): Program {
    const program: Program = { functions: new Map() };
    addFunction(program, "main");
    return program;
}

export function findDefinition(program: Program, selectedFunction: string, node: Node): NodeDefinition | undefined {
    switch (node.type) {
        case "function": return findUserFunctionDefinition(program, selectedFunction);
        case "constant": return findConstantDefinition(node.varType);
        case "variable": return findVariableDefinition(program, selectedFunction, node.varName);
        case "coreFunctionCall": return findCoreFunctionDefinition(node.funcName);
        case "userFunctionCall": return findUserFunctionDefinition(program, node.funcName);
    }
}

export function findConstantDefinition(type: ConstantVarType): ConstantDefinition {
    return constantDefinitions.get(type)!;
}

export function findVariableDefinition(
    program: Program,
    selectedFunction: string,
    varName: string
): VariableDefinition | undefined {
    const func = program.functions.get(selectedFunction);
    if (func === undefined) {
        return undefined;
    }
    return func.variables.get(varName);
}


export function findCoreFunctionDefinition(funcName: string): CoreFunctionDefinition | undefined {
    return coreFunctionDefinitions.get(funcName);
}

export function findUserFunctionDefinition(program: Program, funcName: string): UserFunctionDefinition | undefined {
    return program.functions.get(funcName);
}

export function createFunctionNode(operation: FunctionNodeOperation, x: number, y: number): Node {
    return { id: uuid(), x, y, type: "function", operation };
}

export function createConstantNode(type: ConstantVarType, x: number, y: number): Node {
    const base: Pick<ConstantNode, "id" | "x" | "y" | "type" | "varType"> = {
        id: uuid(), x, y, type: "constant", varType: type
    };
    switch (type) {
        case "boolean": return { ...base, value: false };
        case "number": return { ...base, value: 0 };
        case "string": return { ...base, value: "" };
    }
}

export function createCoreFunctionCallNode(funcName: string, x: number, y: number): Node {
    return { id: uuid(), x, y, type: "coreFunctionCall", funcName };
}

export function createUserFunctionCallNode(funcName: string, x: number, y: number): Node {
    return { id: uuid(), x, y, type: "userFunctionCall", funcName };
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
        type: "userFunction",
        name,
        inputs: [["", "exec"]],
        outputs: [["", "exec"]],
        position: new Vector2(64, 64),
        scale: 1,
        nodes: [],
        links: [],
        variables: new Map(),
    });
    addNode(program, name, createFunctionNode("entry", 0, 0));
    return name;
}

export function deleteFunction(program: Program, name: string) {
    if (name === "main") {
        return;
    }
    program.functions.delete(name);
}