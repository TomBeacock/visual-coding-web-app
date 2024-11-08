'use client'

import { Dispatch, ForwardedRef, forwardRef, RefObject, SetStateAction, useContext, useImperativeHandle, useRef, useState } from "react";
import { createDockNode, DockLayoutContext } from "./dock-layout";
import { DockBoxData, DockLayoutData, DockNodeData, Direction } from "./dock-data";
import { clamp01 } from "../clamp";
import { findNodeInLayout, setWeightInLayout } from "./dock-algorithm";

type DividerProps = {
    direction: Direction,
    parentRef: RefObject<HTMLDivElement>,
    index: number,
    prevNodeId: string,
    nextNodeId: string,
}

function Divider({ direction, parentRef, index, prevNodeId, nextNodeId }: DividerProps) {
    const dockLayoutContext = useContext(DockLayoutContext);

    function onPointerDown(event: React.PointerEvent) {
        event.preventDefault();
        document.documentElement.style.cursor = direction === "row" ? "ew-resize" : "ns-resize";
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
    }

    function onPointerMove(event: PointerEvent) {
        if (dockLayoutContext.layout === null || parentRef.current === null) {
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

        const prevNodeData = findNodeInLayout(dockLayoutContext.layout, prevNodeId);
        const nextNodeData = findNodeInLayout(dockLayoutContext.layout, nextNodeId);
        const totalWeight =
            (prevNodeData?.weight !== undefined ? prevNodeData.weight : 1) +
            (nextNodeData?.weight !== undefined ? nextNodeData.weight : 1);

        const weights = calculateWeights(pos, minBound, maxBound, totalWeight);

        const newLayout = { ...dockLayoutContext.layout };
        setWeightInLayout(newLayout, prevNodeId, weights.prev);
        setWeightInLayout(newLayout, nextNodeId, weights.next);

        dockLayoutContext.setLayout(newLayout);
    }

    function onPointerUp(event: PointerEvent) {
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

    const className = direction === "row" ?
        "horizontal cursor-ew-resize" :
        "vertical cursor-ns-resize";

    return (
        <div
            className={`dock-divider flex-none basis-1.5 ${className}`}
            onPointerDown={onPointerDown}
        >
        </div>
    );
}

export const DockBox = forwardRef(function DockBox({ data: { direction, weight, children } }: { data: DockBoxData }, ref: ForwardedRef<HTMLDivElement>) {
    const selfRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => selfRef.current!);

    // Create child nodes
    let childElements: React.ReactNode[] = []
    for (let i = 0; i < children.length; i++) {
        // Create dividing element
        if (i > 0) {
            childElements.push(
                <Divider
                    key={i}
                    direction={direction}
                    parentRef={selfRef}
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
            ref={selfRef}
            className={`flex basis-0 ${direction === "row" ? "flex-row" : "flex-col"}`}
            style={{ flexGrow: weight }}
        >
            {childElements}
        </div>
    );
});