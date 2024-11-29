"use client"

import { Vector2 } from "@/app/lib/vector2";
import classes from "./graph-link.module.css";
import { TypedPin } from "@/app/lib/program/program-data";
import { useEffect, useRef } from "react";
import { useGraph } from "../graph-area";
import { useProgram } from "../../app-provider/app-provider";

function calculatePath(
    x1: number, y1: number,
    x2: number, y2: number,
    curveRadius: number,
    minOffset: number,
    padding: number
): {
    x: number, y: number,
    width: number, height: number,
    path: string
} {
    const dx = minOffset;
    const p = padding;

    // Bounds
    const minX = Math.min(x1, x2 - dx) - p;
    const maxX = Math.max(x1 + dx, x2) + p;
    const minY = Math.min(y1, y2) - p;
    const maxY = Math.max(y1, y2) + p;
    const width = maxX - minX
    const height = maxY - minY;

    let path: string = "";
    // Horizontal path
    if (y1 === y2) {
        if (x1 === x2) {
            path = "";
        }
        else if (x2 > x1) {
            path = `h ${x2 - x1}`;
        }
        else {
            path = `h ${dx} h ${x2 - 2 * dx - x1} h ${dx}`
        }
    }
    // Single joint path
    else if (x1 + dx <= x2 - dx) {
        const cr = Math.min(curveRadius, Math.abs(y2 - y1) / 2); // Curve radius
        const sign = y2 > y1 ? 1 : -1;
        const scr = cr * sign; // Signed curve radius
        const w = (x2 - x1) / 2 - cr; // Horizontal segments width
        const h = (Math.abs(y2 - y1) - 2 * cr) * sign; // Vertical segment height
        path = `h ${w} q ${cr} 0, ${cr} ${scr} v ${h} q 0 ${scr}, ${cr} ${scr} h ${w}`;
    }
    // Double joint path (S-bend)
    else {
        const cr = Math.min(curveRadius, Math.abs(y2 - y1) / 4); // Curve radius
        const icr = Math.min(curveRadius, cr, ((x1 + dx) - (x2 - dx)) / 2); // Inner curve radius
        const sign = y2 > y1 ? 1 : -1;
        const scr = cr * sign; // Signed curve radius
        const sicr = icr * sign; // Signed inner curve radius
        const w = x1 - x2 + 2 * dx - 2 * icr; // Horizontal segment width
        const h = (Math.abs(y2 - y1) - 2 * cr - 2 * icr) / 2 * sign; // Vertical segments height
        path = `h ${dx - cr} q ${cr} 0, ${cr} ${scr} v ${h} q 0 ${sicr}, ${-icr} ${sicr} h ${-w} q ${-icr} 0, ${-icr} ${sicr} v ${h} q 0 ${scr}, ${cr} ${scr} h ${dx - cr}`;
    }

    path = `M ${x1 - minX} ${y1 - minY} ${path}`;

    return {
        x: minX, y: minY,
        width: width, height: height,
        path: path
    };
}

export type GraphLinkProps = {
    start: TypedPin | Vector2,
    end: TypedPin | Vector2,
    color: string,
}

export function GraphLink({ start, end, color }: GraphLinkProps) {
    const ref = useRef<SVGSVGElement>(null);
    const { program } = useProgram();
    const { transformScreenPointToGraph } = useGraph();

    useEffect(() => {
        if (ref.current === null) {
            return;
        }

        let startPoint: Vector2;
        if (start instanceof Vector2) {
            startPoint = start;
        }
        else {
            const pin = document.getElementById(`${start.nodeId}-${start.type}-${start.index}`);
            if (pin === null) {
                console.error(`Failed to find start pin: ${start.nodeId}-${start.type}-${start.index}`);
                startPoint = Vector2.zero();
            }
            else {
                const rect = pin.getBoundingClientRect();
                const screenPos = new Vector2(rect.x + rect.width / 2, rect.y + rect.height / 2);
                startPoint = transformScreenPointToGraph(screenPos);
            }
        }
        let endPoint: Vector2;
        if (end instanceof Vector2) {
            endPoint = end;
        }
        else {
            const pin = document.getElementById(`${end.nodeId}-${end.type}-${end.index}`);
            if (pin === null) {
                console.error(`Failed to find end pin: ${end.nodeId}-${end.type}-${end.index}`);
                endPoint = Vector2.zero();
            }
            else {
                const rect = pin.getBoundingClientRect();
                const screenPos = new Vector2(rect.x + rect.width / 2, rect.y + rect.height / 2);
                endPoint = transformScreenPointToGraph(screenPos);
            }
        }
        const data = calculatePath(startPoint.x, startPoint.y, endPoint.x, endPoint.y, 8, 32, 4);

        const svg = ref.current;
        svg.setAttribute("width", `${data.width}px`);
        svg.setAttribute("height", `${data.height}px`);
        svg.style.left = `${data.x}px`;
        svg.style.top = `${data.y}px`;
        svg.children[0].setAttribute("d", data.path);
    }, [start, end, transformScreenPointToGraph, program]);

    let pathData = { x: 0, y: 0, width: 0, height: 0, path: "" };

    if (start instanceof Vector2 && end instanceof Vector2) {
        pathData = calculatePath(start.x, start.y, end.x, end.y, 8, 32, 4);
    }

    return (
        <svg
            ref={ref}
            className={classes.link}
            xmlns="http://www.w3.org/2000/svg"
            width={pathData.width}
            height={pathData.height}
            fill="none"
            strokeWidth={2}
            stroke={color}
            style={{ left: pathData.x, top: pathData.y }}
        >
            <path d={pathData.path} />
        </svg>
    );
}