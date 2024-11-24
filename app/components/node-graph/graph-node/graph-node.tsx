import classes from "./graph-node.module.css";
import { CSSProperties, ReactNode, useRef } from "react";
import { Node, Pin, PinType, TypedPin, VariableType } from "@/app/lib/program/program-data";
import { useProgram } from "../../app-provider/app-provider";
import { findDefinition } from "@/app/lib/program/program-algorithm";
import { GraphPin } from "./graph-pin";
import { camelCaseToWords, getCategoryColor, getIcon } from "@/app/lib/program/program-util";
import { Vector2 } from "@/app/lib/vector2";
import { useGraph } from "../graph-area";
import { AutoScrollLabel } from "../../auto-scroll-label/auto-scroll-label";
import Checkbox from "../../checkbox/checkbox";
import TextInput from "../../text-input/text-input";
import NumberInput from "../../number-input/number-input";

declare module "react" {
    interface CSSProperties {
        "--node-cell-width"?: number;
    }
}

type GraphNodeProps = {
    node: Node,
}

export function GraphNode({ node }: GraphNodeProps) {
    const { program, setProgram, selectedFunction } = useProgram();
    const { gridSize, nodeCellWidth, snapPointToGrid, transformScreenPointToGraph } = useGraph();

    const ref = useRef<HTMLDivElement>(null);
    const dragOffset = useRef(Vector2.zero());

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

    const definition = findDefinition(node);
    if (definition === undefined) {
        return <></>;
    }

    const f = program.functions.get(selectedFunction);
    if (f === undefined) {
        return <></>;
    }

    let contents: ReactNode;
    const width = definition.widthOverride || nodeCellWidth;
    if (node.type === "constant") {
        const connected = f.links.find((link) => link.src.nodeId === node.id) !== undefined;
        contents = (
            <div className={classes.body}>
                <GraphConstant
                    value={node.value}
                    connected={connected}
                    pin={{ nodeId: node.id, index: 0, type: "output" }}
                    varType={typeof node.value as VariableType}
                    pinX={node.x + gridSize * (width - 0.5)}
                    pinY={node.y + gridSize * 0.5}
                />
            </div>
        );
    }
    else {
        const vars: ReactNode[] = [];
        let key = 0;
        let i = 0;
        for (const [varName, varType] of definition.outputs) {
            const connected = f.links.find((link) => link.src.nodeId === node.id && link.src.index === i) !== undefined;
            vars.push(
                <GraphVar
                    key={key}
                    name={camelCaseToWords(varName)}
                    connected={connected}
                    pin={{ nodeId: node.id, index: i, type: "output" }}
                    varType={varType}
                    pinX={node.x + gridSize * (width - 0.5)}
                    pinY={node.y + gridSize * (key + 1.5)}
                />);
            key++;
            i++;
        }
        i = 0;
        for (const [varName, varType] of definition.inputs) {
            const connected = f.links.find((link) => link.dst.nodeId === node.id && link.dst.index === i) !== undefined;
            vars.push(
                <GraphVar
                    key={key}
                    name={camelCaseToWords(varName)}
                    connected={connected}
                    pin={{ nodeId: node.id, index: i, type: "input" }}
                    varType={varType}
                    pinX={node.x + gridSize * 0.5}
                    pinY={node.y + gridSize * (key + 1.5)}
                />);
            key++;
            i++;
        }
        contents = (
            <>
                <div
                    className={classes.head}
                    style={{ backgroundColor: getCategoryColor(definition.category) }}
                >
                    {getIcon(definition.icon)}
                    <AutoScrollLabel>{camelCaseToWords(definition.name)}</AutoScrollLabel>
                </div>
                <div className={classes.body}>
                    {vars}
                </div>
            </>
        );
    }

    const style: CSSProperties = {
        left: node.x + 1,
        top: node.y + 1,
    }

    if (definition.widthOverride !== undefined) {
        style["--node-cell-width"] = definition.widthOverride;
    }

    return (
        <div
            ref={ref}
            className={classes.node}
            style={style}
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
    varType: VariableType,
    pinX: number,
    pinY: number,
}

function GraphVar({ name, connected, pin, varType, pinX, pinY }: GraphVarProps) {
    const graphPin = (
        <GraphPin
            connected={connected}
            pin={pin}
            varType={varType}
            x={pinX} y={pinY}
        />
    );
    const label = <AutoScrollLabel>{name}</AutoScrollLabel>;
    return (
        <div
            className={`${classes.row} ${pin.type === "input" ? classes.input : classes.output}`}
            data-connected={connected}
        >
            {pin.type === "input" ? <>{graphPin}{label}</> : <>{label}{graphPin}</>}
        </div>
    );
}

type GraphConstantProps = {
    value: boolean | number | string,
    connected?: boolean,
    pin: TypedPin,
    varType: VariableType,
    pinX: number,
    pinY: number,
}

function GraphConstant({ value, connected, pin, varType, pinX, pinY }: GraphConstantProps) {
    let input = (function () {
        switch (typeof value) {
            case "boolean": return <Checkbox defaultChecked={value}/>;
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
                x={pinX} y={pinY}
            />
        </div>
    );
}