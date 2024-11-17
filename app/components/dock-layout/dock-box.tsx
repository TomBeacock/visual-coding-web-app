"use client"

import classes from "./dock-layout.module.css";
import { RefObject, useRef } from "react";
import { createDockNode } from "./dock-layout";
import { DockBoxData, Direction } from "./dock-data";
import { clamp01 } from "../../lib/clamp";
import { findNodeInLayout, setWeightInLayout } from "./dock-algorithm";
import { useDock } from "./dock-provider";

type DividerProps = {
    direction: Direction,
    parentRef: RefObject<HTMLDivElement>,
    index: number,
    prevNodeId: string,
    nextNodeId: string,
}

function Divider({ direction, parentRef, index, prevNodeId, nextNodeId }: DividerProps) {
    const dock = useDock();

    function onPointerDown(event: React.PointerEvent) {
        event.preventDefault();
        document.documentElement.style.cursor = direction === "row" ? "ew-resize" : "ns-resize";
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
    }

    function onPointerMove(event: PointerEvent) {
        if (dock.layout === null || parentRef.current === null) {
            return;
        }

        const pos = direction === "row" ? event.x : event.y;

        const prevElement = parentRef.current.children[index - 1];
        const minBound = direction === "row" ?
            prevElement.getBoundingClientRect().left :
            prevElement.getBoundingClientRect().top;

        const nextElement = parentRef.current.children[index + 1];
        const maxBound = direction === "row" ?
            nextElement.getBoundingClientRect().right :
            nextElement.getBoundingClientRect().bottom;

        const prevNodeData = findNodeInLayout(dock.layout, prevNodeId);
        const nextNodeData = findNodeInLayout(dock.layout, nextNodeId);
        const totalWeight =
            (prevNodeData?.weight !== undefined ? prevNodeData.weight : 1) +
            (nextNodeData?.weight !== undefined ? nextNodeData.weight : 1);

        const weights = calculateWeights(pos, minBound, maxBound, totalWeight);

        const newLayout = { ...dock.layout };
        setWeightInLayout(newLayout, prevNodeId, weights.prev);
        setWeightInLayout(newLayout, nextNodeId, weights.next);

        dock.setLayout(newLayout);
    }

    function onPointerUp() {
        document.documentElement.style.cursor = "";
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
    }

    function calculateWeights(pos: number, minBound: number, maxBound: number, weight: number)
        : { prev: number, next: number } {
        const percent = clamp01((pos - minBound) / (maxBound - minBound));
        return {
            prev: weight * percent,
            next: weight * (1 - percent)
        };
    }

    return (
        <div
            className={classes.divider}
            data-direction={direction}
            onPointerDown={onPointerDown}
        >
        </div>
    );
}

export function DockBox({ data: { direction, weight, children } }: { data: DockBoxData }) {
    const ref = useRef<HTMLDivElement>(null);

    // Create child nodes
    const childElements: React.ReactNode[] = []
    for (let i = 0; i < children.length; i++) {
        // Create dividing element
        if (i > 0) {
            childElements.push(
                <Divider
                    key={i}
                    direction={direction}
                    parentRef={ref}
                    index={(i - 1) * 2 + 1}
                    prevNodeId={children[i - 1].id!}
                    nextNodeId={children[i].id!}
                />
            );
        }
        childElements.push(createDockNode(children[i]));
    }

    return (
        <div
            ref={ref}
            className={classes.box}
            data-direction={direction}
            style={{ flexGrow: weight }}
        >
            {childElements}
        </div>
    );
};