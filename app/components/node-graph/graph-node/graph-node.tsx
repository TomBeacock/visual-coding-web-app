import classes from "./graph-node.module.css";
import { useRef } from "react";
import { IconCircle, IconPlayerPlay } from "@tabler/icons-react";
import { Node, VariableType } from "@/app/lib/program/program-data";
import { useProgram } from "../../app-provider/app-provider";
import { findDefinition } from "@/app/lib/program/program-algorithm";

type PinProps = {
    type: "arrow" | "circle";
    color: string;
    connected?: boolean;
}

function Pin({ type, color, connected }: PinProps) {
    function onPointerDown(event: React.PointerEvent) {
        event.stopPropagation();
    }

    const iconProps = {
        color: "currentColor",
        size: 16,
    };

    const icon = type === "arrow" ? <IconPlayerPlay {...iconProps} /> : <IconCircle {...iconProps} />;

    return (
        <div
            className={classes.pin}
            style={{ color }}
            data-connected={connected}
            onPointerDown={onPointerDown}
        >
            {icon}
        </div>
    );
}

type VarProps = {
    name: string,
    connected?: boolean,
    varType: VariableType,
}

function Input({ name, connected, varType }: VarProps) {
    return (
        <div
            className={`${classes.row} ${classes.input}`}
            data-connected={connected}
        >
            <Pin
                type={varType === "exec" ? "arrow" : "circle"}
                color={`var(--type-${varType}-color)`}
                connected={connected}
            />
            <span>{name}</span>
        </div>
    );
}

function Output({ name, connected, varType }: VarProps) {
    return (
        <div className={`${classes.row} ${classes.output}`}>
            <span>{name}</span>
            <Pin
                type={varType === "exec" ? "arrow" : "circle"}
                color={`var(--type-${varType}-color)`}
                connected={connected}
            />
        </div>
    );
}

type GraphNodeProps = {
    data: Node
}

export function GraphNode({ data: { id, lib, func, x, y, } }: GraphNodeProps) {
    const { program, setProgram, selectedFunction } = useProgram();

    const ref = useRef<HTMLDivElement>(null);
    const dragOrigin = useRef({ pointerX: 0, pointerY: 0 });

    function onPointerDown(event: React.PointerEvent) {
        if (dragOrigin.current === null || event.button !== 0) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
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

        const newProgram = {...program};
        const func = newProgram.functions.get(selectedFunction);
        if(func === undefined) {
            return;
        }
        const node = func.nodes.find((node) => node.id === id);
        if(node === undefined) {
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
        if(func !== undefined) {
            name = definition.name;
            let key = 0;
            let i = 0;
            for (const [varName, varType] of definition.outputs) {
                const connected = func.links.find((link) => link.src.nodeId === id && link.src.index === i) !== undefined;
                vars.push(<Output key={key} name={varName} connected={connected} varType={varType} />);
                key++;
                i++;
            }
            i = 0;
            for (const [varName, varType] of definition.inputs) {
                const connected = func.links.find((link) => link.dst.nodeId === id && link.dst.index === i) !== undefined;
                vars.push(<Input key={key} name={varName} connected={connected} varType={varType} />);
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