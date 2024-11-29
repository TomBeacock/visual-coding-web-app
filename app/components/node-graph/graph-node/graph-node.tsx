"use client"

import classes from "./graph-node.module.css";
import { ReactNode, useEffect, useRef } from "react";
import { Node, TypedPin, PinVarType } from "@/app/lib/program/program-data";
import { useProgram } from "../../app-provider/app-provider";
import { findCoreFunctionDefinition, findUserFunctionDefinition, findVariableDefinition } from "@/app/lib/program/program-algorithm";
import { GraphPin } from "./graph-pin";
import { camelCaseToWords, getCategoryColor, getIcon } from "@/app/lib/program/program-util";
import { Vector2 } from "@/app/lib/vector2";
import { useGraph } from "../graph-area";
import Checkbox from "../../checkbox/checkbox";
import TextInput from "../../text-input/text-input";
import NumberInput from "../../number-input/number-input";

type GraphNodeProps = {
    node: Node,
}

export function GraphNode({ node }: GraphNodeProps) {
    const { program, setProgram, selectedFunction } = useProgram();
    const { gridSize, snapPointToGrid, transformScreenPointToGraph } = useGraph();

    const ref = useRef<HTMLDivElement>(null);
    const dragOffset = useRef(Vector2.zero());

    useEffect(() => {
        if (ref.current === null) {
            return;
        }
        const width = Math.ceil(ref.current.clientWidth / gridSize) * gridSize;
        ref.current.style.width = `${width - 2}px`;
    });

    function onPointerDown(event: React.PointerEvent) {
        if (dragOffset.current === null ||
            event.button !== 0 ||
            event.defaultPrevented ||
            (event.target as HTMLElement).tagName === "INPUT"
        ) {
            return;
        }

        document.documentElement.classList.add("grabbing-cursor");

        dragOffset.current =
            new Vector2(node.x, node.y)
                .sub(transformScreenPointToGraph(new Vector2(event.clientX, event.clientY)));

        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
    }

    function onPointerMove(event: PointerEvent) {
        if (ref.current === null || dragOffset.current === null) {
            return;
        }

        const newProgram = { ...program };
        const newFunc = newProgram.functions.get(selectedFunction);
        if (newFunc === undefined) {
            return;
        }
        const newNode = newFunc.nodes.find((n) => n.id === node.id);
        if (newNode === undefined) {
            return;
        }

        const targetPos =
            transformScreenPointToGraph(new Vector2(event.clientX, event.clientY))
                .add(dragOffset.current);
        snapPointToGrid(targetPos);

        newNode.x = targetPos.x;
        newNode.y = targetPos.y;

        setProgram(newProgram);
    }

    function onPointerUp() {
        document.documentElement.classList.remove("grabbing-cursor");
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
    }

    const func = program.functions.get(selectedFunction);
    if (func === undefined) {
        return <></>;
    }

    const isInputPinConnected =
        (i: number) => func.links.find((link) => link.dst.nodeId === node.id && link.dst.index === i) !== undefined;
    const isOutputPinConnected =
        (i: number) => func.links.find((link) => link.src.nodeId === node.id && link.src.index === i) !== undefined;

    let contents: ReactNode;

    if (node.type === "constant") {
        contents = (
            <div className={classes.body}>
                <GraphConstant
                    value={node.value}
                    connected={isOutputPinConnected(0)}
                    pin={{ nodeId: node.id, index: 0, type: "output" }}
                    varType={typeof node.value as PinVarType}
                />
            </div>
        );
    }
    else if (node.type === "function") {
        const definition = findUserFunctionDefinition(program, selectedFunction);
        if (definition === undefined) {
            return <></>;
        }

        if (node.operation === "entry") {
            const vars: ReactNode[] = [];
            let i = 0;
            for (const [varName, varType] of definition.inputs) {
                vars.push(
                    <GraphVar
                        key={i}
                        name={camelCaseToWords(varName)}
                        connected={isOutputPinConnected(i)}
                        pin={{ nodeId: node.id, index: i, type: "output" }}
                        varType={varType}
                    />
                );
                i++;
            }
            contents = (
                <>
                    <div
                        className={classes.head}
                        style={{ backgroundColor: getCategoryColor("function") }}
                    >
                        {getIcon(definition.icon)}
                        <span>{camelCaseToWords(definition.name)}</span>
                    </div>
                    <div className={classes.body}>
                        {vars}
                    </div>
                </>
            );
        }
        else {
            const vars: ReactNode[] = [];
            let i = 0;
            for (const [varName, varType] of definition.outputs) {
                vars.push(
                    <GraphVar
                        key={i}
                        name={camelCaseToWords(varName)}
                        connected={isInputPinConnected(i)}
                        pin={{ nodeId: node.id, index: i, type: "input" }}
                        varType={varType}
                    />
                );
                i++;
            }
            contents = (
                <>
                    <div
                        className={classes.head}
                        style={{ backgroundColor: getCategoryColor("function") }}
                    >
                        {getIcon("return")}
                        <span>{camelCaseToWords("return")}</span>
                    </div>
                    <div className={classes.body}>
                        {vars}
                    </div>
                </>
            );
        }
    }
    else if (node.type === "variable") {
        const definition = findVariableDefinition(program, selectedFunction, node.varName);
        if (definition === undefined) {
            return <></>;
        }
        if (node.operation === "get") {
            contents = (
                <>
                    <div className={classes.body}>
                        <GraphVar
                            name={definition.name}
                            connected={isOutputPinConnected(0)}
                            pin={{ nodeId: node.id, index: 0, type: "output" }}
                            varType={definition.varType}
                        />
                    </div>
                </>
            );
        }
        else {
            contents = (
                <>
                    <div
                        className={classes.head}
                        style={{ backgroundColor: getCategoryColor() }}
                    >
                        {getIcon()}
                        <span>{"Set"}</span>
                    </div>
                    <div className={classes.body}>
                        <GraphDoubleVar
                            input={{
                                name: "",
                                connected: isInputPinConnected(0),
                                pin: { nodeId: node.id, index: 0, type: "input" },
                                varType: "exec",
                            }}
                            output={{
                                name: "",
                                connected: isOutputPinConnected(0),
                                pin: { nodeId: node.id, index: 0, type: "output" },
                                varType: "exec",
                            }}
                        />
                        <GraphDoubleVar
                            input={{
                                name: camelCaseToWords(definition.name),
                                connected: isInputPinConnected(1),
                                pin: { nodeId: node.id, index: 1, type: "input" },
                                varType: definition.varType,
                            }}
                            output={{
                                name: "",
                                connected: isOutputPinConnected(1),
                                pin: { nodeId: node.id, index: 1, type: "output" },
                                varType: definition.varType,
                            }}
                        />
                    </div>
                </>
            );
        }
    }
    else if (node.type === "coreFunctionCall") {
        const definition = findCoreFunctionDefinition(node.funcName);
        if (definition === undefined) {
            return <></>;
        }
        const vars: ReactNode[] = [];
        const length = Math.max(definition.inputs.length, definition.outputs.length);
        for (let i = 0; i < length; i++) {
            if (i < definition.inputs.length && i < definition.outputs.length) {
                const [inputName, inputType] = definition.inputs[i];
                const [outputName, outputType] = definition.outputs[i];
                vars.push(
                    <GraphDoubleVar
                        key={i}
                        input={{
                            name: camelCaseToWords(inputName),
                            connected: isInputPinConnected(i),
                            pin: { nodeId: node.id, index: i, type: "input" },
                            varType: inputType,
                        }}
                        output={{
                            name: camelCaseToWords(outputName),
                            connected: isOutputPinConnected(i),
                            pin: { nodeId: node.id, index: i, type: "output" },
                            varType: outputType,
                        }}
                    />
                );
            }
            else if (i < definition.inputs.length) {
                const [inputName, inputType] = definition.inputs[i];
                vars.push(
                    <GraphVar
                        key={i}
                        name={camelCaseToWords(inputName)}
                        connected={isInputPinConnected(i)}
                        pin={{ nodeId: node.id, index: i, type: "input" }}
                        varType={inputType}
                    />
                );
            }
            else {
                const [outputName, outputType] = definition.outputs[i];
                vars.push(
                    <GraphVar
                        key={i}
                        name={camelCaseToWords(outputName)}
                        connected={isOutputPinConnected(i)}
                        pin={{ nodeId: node.id, index: i, type: "output" }}
                        varType={outputType}
                    />
                );
            }
        }
        contents = (
            <>
                <div
                    className={classes.head}
                    style={{ backgroundColor: getCategoryColor(definition.category) }}
                >
                    {getIcon(definition.icon)}
                    <span>{camelCaseToWords(definition.name)}</span>
                </div>
                <div className={classes.body}>
                    {vars}
                </div>
            </>
        );
    }

    return (
        <div
            ref={ref}
            className={classes.node}
            style={{ left: node.x + 1, top: node.y + 1 }}
            onPointerDown={onPointerDown}
        >
            {contents}
        </div>
    );
}

type GraphVarProps = {
    name: string,
    connected?: boolean,
    pin: TypedPin,
    varType: PinVarType,
}

function GraphVar({ name, connected, pin, varType }: GraphVarProps) {
    const graphPin = (
        <GraphPin
            connected={connected}
            pin={pin}
            varType={varType}
        />
    );
    const label = <span>{name}</span>;
    return (
        <div className={`${classes.row} ${pin.type === "input" ? classes.input : classes.output}`}>
            {pin.type === "input" ? <>{graphPin}{label}</> : <>{label}{graphPin}</>}
        </div>
    );
}

type GraphDoubleVarProps = {
    input: GraphVarProps,
    output: GraphVarProps,
}

function GraphDoubleVar({ input, output }: GraphDoubleVarProps) {
    return (
        <div className={`${classes.row} ${classes.double}`}>
            <GraphPin
                connected={input.connected}
                pin={input.pin}
                varType={input.varType}
            />
            <span>{input.name}</span>
            <span>{output.name}</span>
            <GraphPin
                connected={output.connected}
                pin={output.pin}
                varType={output.varType}
            />
        </div>
    );
}

type GraphConstantProps = {
    value: boolean | number | string,
    connected?: boolean,
    pin: TypedPin,
    varType: PinVarType,
}

function GraphConstant({ value, connected, pin, varType }: GraphConstantProps) {
    const input = (function () {
        switch (typeof value) {
            case "boolean": return <Checkbox defaultChecked={value} />;
            case "number": return <NumberInput defaultValue={value} selectOnFocus />;
            case "string": return <TextInput defaultValue={value} selectOnFocus />;
            default: return <></>;
        }
    })();
    return (
        <div
            className={`${classes.row} ${classes.output} ${classes.constant}`}
            data-connected={connected}
        >
            {input}
            <GraphPin
                connected={connected}
                pin={pin}
                varType={varType}
            />
        </div>
    );
}