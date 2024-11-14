import { Node, NodeDefinition } from "./program-data";
import { std } from "./program-std";

export function findDefinition(node: Node): NodeDefinition | undefined {
    if(node.lib === "std") {
        return std.get(node.func);
    }
    return undefined;
}