import { PinVarType } from "./program-data";
import {
    IconAbc,
    IconArrowBack,
    IconArrowIteration,
    IconArrowsSplit2,
    IconBinary,
    IconChevronsLeft,
    IconChevronsRight,
    IconDivide,
    IconEqual,
    IconEqualNot,
    IconExposureMinus1,
    IconExposurePlus1,
    IconFunction,
    IconLogicAnd,
    IconLogicNot,
    IconLogicOr,
    IconLogicXor,
    IconMath,
    IconMathEqualGreater,
    IconMathEqualLower,
    IconMathGreater,
    IconMathLower,
    IconMinus,
    IconNumber123,
    IconPercentage,
    IconPlus,
    IconToggleRight,
    IconVariable,
    IconX
} from "@tabler/icons-react";

export function getVariableTypeColor(varType: PinVarType) {
    return `var(--type-${varType}-color)`;
}

export function getCategoryColor(category?: string) {
    if (category === undefined) {
        return "var(--category-default-color)";
    }
    return `var(--category-${camelCaseToSnake(category)}-color)`;
}

export function getIcon(icon?: string) {
    if (icon === undefined) {
        return <IconFunction />
    }
    switch (icon) {
        case "boolean": return <IconToggleRight />;
        case "number": return <IconNumber123 />;
        case "string": return <IconAbc />;
        case "math": return <IconMath />;
        case "binary": return <IconBinary />;
        case "plus": return <IconPlus />;
        case "minus": return <IconMinus />;
        case "cross": return <IconX />;
        case "divide": return <IconDivide />;
        case "percentage": return <IconPercentage />
        case "increment": return <IconExposurePlus1 />
        case "decrement": return <IconExposureMinus1 />
        case "equal": return <IconEqual />;
        case "notEqual": return <IconEqualNot />;
        case "less": return <IconMathLower />;
        case "lessEqual": return <IconMathEqualLower />;
        case "greater": return <IconMathGreater />;
        case "greaterEqual": return <IconMathEqualGreater />;
        case "not": return <IconLogicNot />;
        case "and": return <IconLogicAnd />;
        case "or": return <IconLogicOr />;
        case "xor": return <IconLogicXor />
        case "leftShift": return <IconChevronsLeft />
        case "rightShift": return <IconChevronsRight />
        case "branch": return <IconArrowsSplit2 />;
        case "loop": return <IconArrowIteration />;
        case "return": return <IconArrowBack />
        case "variable": return <IconVariable />
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