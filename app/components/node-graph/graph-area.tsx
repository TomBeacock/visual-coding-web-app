import classes from "./graph-area.module.css"
import { useRef } from "react";
import { clamp } from "@/app/lib/clamp";
import { useProgram } from "../app-provider/app-provider";
import { GraphNode } from "./graph-node/graph-node";
import { GraphLink } from "./graph-link/graph-link";
import { findDefinition } from "@/app/lib/program/program-algorithm";

declare module "react" {
    interface CSSProperties {
        "--grid-size"?: string;
    }
}

export function GraphArea() {
    const { program, selectedFunction } = useProgram();

    const viewportRef = useRef<HTMLDivElement>(null);
    const areaRef = useRef<HTMLDivElement>(null);
    const position = useRef({ x: 0, y: 0 });
    const dragOrigin = useRef({ positionX: 0, positionY: 0, pointerX: 0, pointerY: 0 });

    const gridSize = 32;

    function onPointerDown(event: React.PointerEvent) {
        if (dragOrigin.current === null || event.button !== 1) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        document.documentElement.classList.add("move-cursor");

        dragOrigin.current = {
            positionX: position.current.x,
            positionY: position.current.y,
            pointerX: event.clientX,
            pointerY: event.clientY,
        };

        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
    }

    function onPointerMove(event: PointerEvent) {
        if (
            viewportRef.current === null || areaRef.current === null ||
            position.current === null || dragOrigin.current === null) {
            return;
        }

        const offset = {
            x: event.clientX - dragOrigin.current.pointerX,
            y: event.clientY - dragOrigin.current.pointerY,
        }

        position.current.x = dragOrigin.current.positionX + offset.x;
        position.current.y = dragOrigin.current.positionY + offset.y;

        const mod: (x: number) => number = x => x % gridSize + gridSize / 2;

        viewportRef.current.style.backgroundPosition = `${mod(position.current.x)}px ${mod(position.current.y)}px`;
        areaRef.current.style.left = `${position.current.x}px`;
        areaRef.current.style.top = `${position.current.y}px`;
    }

    function onPointerUp() {
        document.documentElement.classList.remove("move-cursor");
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
    }

    function onWheel(event: React.WheelEvent) {
        if (areaRef.current === null) {
            return;
        }
        console.log(event.deltaY);
        const currentScale = Number(areaRef.current.style.scale);
        const newScale = currentScale + event.deltaY * -0.001;
        areaRef.current.style.scale = `${clamp(newScale, 0.1, 2.0)}`;
    }

    const nodes: React.ReactNode[] = [];
    const links: React.ReactNode[] = [];

    const func = program.functions.get(selectedFunction);
    if (func !== undefined) {
        for (const node of func.nodes) {
            nodes.push(<GraphNode key={node.id} data={node} />);
        }

        let key = 0;
        for (const { src, dst } of func.links) {
            const srcNode = func.nodes.find((node) => node.id === src.nodeId);
            const dstNode = func.nodes.find((node) => node.id === dst.nodeId);
            if (srcNode === undefined || dstNode === undefined) {
                continue;
            }
            const dstDef = findDefinition(dstNode);
            if(dstDef === undefined) {
                continue; 
            }
            const type = [...dstDef.inputs][dst.index][1];
            const color = `var(--type-${type}-color)`;
            links.push(<GraphLink
                key={key}
                x1={srcNode.x + gridSize * 7.5}
                y1={srcNode.y + gridSize * (src.index + 1.5)}
                x2={dstNode.x + gridSize * 0.5}
                y2={dstNode.y + gridSize * (dstDef.outputs.size + dst.index + 1.5)}
                color={color}
            />);
            key++;
        }
    }

    return (
        <div
            ref={viewportRef}
            className={classes.viewport}
            style={{
                "--grid-size": `${gridSize}px`,
                backgroundPosition: `${gridSize / 2}px ${gridSize / 2}px`
            }}
            onPointerDown={onPointerDown}
            onWheel={onWheel}
        >
            <div
                ref={areaRef}
                className={classes.area}
                style={{
                    scale: 1,
                    left: 0,
                    top: 0,
                }}
            >
                <div>
                    {links}
                </div>
                <div>
                    {nodes}
                </div>
            </div>
        </div>
    );
}