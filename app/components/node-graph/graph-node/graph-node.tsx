import classes from "./graph-node.module.css";
import { useRef } from "react";
import { Node, Pin as PinType, VariableType } from "@/app/lib/program/program-data";
import { useProgram } from "../../app-provider/app-provider";
import { findDefinition } from "@/app/lib/program/program-algorithm";
import { Pin } from "./graph-pin";

type GraphNodeProps = {
    data: Node
}

export function GraphNode({ data: { id, lib, func, x, y, } }: GraphNodeProps) {
    const { program, setProgram, selectedFunction } = useProgram();

    const ref = useRef<HTMLDivElement>(null);
    const dragOrigin = useRef({ pointerX: 0, pointerY: 0 });

    function onPointerDown(event: React.PointerEvent) {
        if (dragOrigin.current === null || event.button !== 0 || event.defaultPrevented) {
            return;
        }

        event.preventDefault();
        document.documentElement.classList.add("move-cursor");

        dragOrigin.current = {
            pointerX: event.clientX,
            pointerY: event.clientY,
        };

        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
    }

    function onPointerMove(event: PointerEvent) {

        if (ref.current === null || dragOrigin.current === null) {
            return;
        }

        const newProgram = { ...program };
        const func = newProgram.functions.get(selectedFunction);
        if (func === undefined) {
            return;
        }
        const node = func.nodes.find((node) => node.id === id);
        if (node === undefined) {
            return;
        }

        const roundToGrid: (x: number) => number = x => Math.round(x / 32) * 32;

        const offset = {
            x: event.clientX - dragOrigin.current.pointerX,
            y: event.clientY - dragOrigin.current.pointerY,
        }

        node.x = roundToGrid(x + offset.x);
        node.y = roundToGrid(y + offset.y);

        setProgram(newProgram);
    }

    function onPointerUp() {
        document.documentElement.classList.remove("move-cursor");
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
    }

    let name = "Undefined";
    const vars: React.ReactNode[] = [];
    const definition = findDefinition({ id, lib, func, x, y, });
    if (definition !== undefined) {
        const func = program.functions.get(selectedFunction);
        if (func !== undefined) {
            name = definition.name;
            let key = 0;
            let i = 0;
            for (const [varName, varType] of definition.outputs) {
                const connected = func.links.find((link) => link.src.nodeId === id && link.src.index === i) !== undefined;
                vars.push(
                    <Output
                        key={key}
                        name={varName}
                        connected={connected}
                        pin={{ nodeId: id, index: i }}
                        varType={varType}
                        pinX={x + 32 * 7.5}
                        pinY={y + 32 * (key + 1.5)}
                    />);
                key++;
                i++;
            }
            i = 0;
            for (const [varName, varType] of definition.inputs) {
                const connected = func.links.find((link) => link.dst.nodeId === id && link.dst.index === i) !== undefined;
                vars.push(
                    <Input
                        key={key}
                        name={varName}
                        connected={connected}
                        pin={{ nodeId: id, index: i }}
                        varType={varType}
                        pinX={x + 32 * 0.5}
                        pinY={y + 32 * (key + 1.5)}
                    />);
                key++;
                i++;
            }
        }
    }

    return (
        <div
            ref={ref}
            className={classes.node}
            style={{ left: x, top: y }}
            onPointerDown={onPointerDown}
        >
            <div className={classes.head}>
                <span>{name}</span>
            </div>
            <div className={classes.body}>
                {vars}
            </div>
        </div>
    );
}


type VarProps = {
    name: string,
    connected?: boolean,
    pin: PinType,
    varType: VariableType,
    pinX: number,
    pinY: number,
}

function Input({ name, connected, pin, varType, pinX, pinY }: VarProps) {
    return (
        <div
            className={`${classes.row} ${classes.input}`}
            data-connected={connected}
        >
            <Pin
                connected={connected}
                pin={{ ...pin, type: "input" }}
                varType={varType}
                x={pinX} y={pinY}
            />
            <span>{name}</span>
        </div>
    );
}

function Output({ name, connected, pin, varType, pinX, pinY }: VarProps) {
    return (
        <div className={`${classes.row} ${classes.output}`}>
            <span>{name}</span>
            <Pin
                connected={connected}
                pin={{ ...pin, type: "output" }}
                varType={varType}
                x={pinX} y={pinY}
            />
        </div>
    );
}