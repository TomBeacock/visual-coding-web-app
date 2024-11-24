import { VariableType } from "./program-data";
import {
    IconAbc,
    IconArrowIteration,
    IconArrowsSplit2,
    IconDivide,
    IconEqual,
    IconEqualNot,
    IconFunction,
    IconLogicAnd,
    IconLogicNot,
    IconLogicOr,
    IconMath,
    IconMathEqualGreater,
    IconMathEqualLower,
    IconMathGreater,
    IconMathLower,
    IconMinus,
    IconNumber123,
    IconPlus,
    IconToggleRight,
    IconVariable,
    IconX
} from "@tabler/icons-react";

export function getVariableTypeColor(varType: VariableType) {
    return `var(--type-${varType}-color)`;
}

export function getCategoryColor(category: string) {
    return `var(--category-${camelCaseToSnake(category)}-color)`;
}

export function getIcon(icon: string) {
    switch (icon) {
        case "variable": return <IconVariable />
        case "boolean": return <IconToggleRight />;
        case "number": return <IconNumber123 />;
        case "string": return <IconAbc />;
        case "branch": return <IconArrowsSplit2 />;
        case "loop": return <IconArrowIteration />;
        case "math": return <IconMath />;
        case "add": return <IconPlus />;
        case "subtract": return <IconMinus />;
        case "multiply": return <IconX />;
        case "divide": return <IconDivide />;
        case "and": return <IconLogicAnd />;
        case "or": return <IconLogicOr />;
        case "not": return <IconLogicNot />;
        case "equal": return <IconEqual />;
        case "notEqual": return <IconEqualNot />;
        case "less": return <IconMathLower />;
        case "lessEqual": return <IconMathEqualLower />;
        case "greater": return <IconMathGreater />;
        case "greaterEqual": return <IconMathEqualGreater />;
        default: return <IconFunction />;
    }
}

export function camelCaseToWords(camel: string) {
    let result = "";
    let l = 0, r = 0;
    const appendWord = () => {
        result += result === "" ?
            camel.charAt(l).toUpperCase() + camel.substring(l + 1, r) :
            " " + camel.substring(l, r);
    }
    while (r < camel.length) {
        if (camel.charAt(r) === camel.charAt(r).toUpperCase()) {
            appendWord();
            l = r;
        }
        r++;
    }
    if (l < r) {
        appendWord();
    }
    return result;
}

export function camelCaseToSnake(camel: string) {
    let result = "";
    let l = 0, r = 0;
    const appendWord = () => {
        result += result === "" ?
            result += camel.substring(l, r) :
            "-" + camel.charAt(l).toLowerCase() + camel.substring(l + 1, r);
    }
    while (r < camel.length) {
        if (camel.charAt(r) === camel.charAt(r).toUpperCase()) {
            appendWord();
            l = r;
        }
        r++;
    }
    if (l < r) {
        appendWord();
    }
    return result;
}