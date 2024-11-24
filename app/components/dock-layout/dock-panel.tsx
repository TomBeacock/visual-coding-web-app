"use client"

import classes from "./dock-layout.module.css";
import { PropsWithChildren, useRef } from "react";
import { DockPanelData } from "./dock-data";
import { calculateRegionPercent, calculateRegionRect } from "./dock-algorithm";
import { DockTab } from "./dock-tab";
import { useDock } from "./dock-provider";

export function DockPanel({ data: { id, weight, selectedTabId, children } }: { data: DockPanelData }) {
    const ref = useRef<HTMLDivElement>(null);
    const { dragData, setIndicatorProps } = useDock();

    function onDragEnter(event: React.DragEvent) {
        if (dragData.current.srcNodeId === undefined) {
            return;
        }
        event.preventDefault();
    }

    function onDragOver(event: React.DragEvent) {
        if (dragData.current.srcNodeId === undefined) {
            return;
        }

        event.preventDefault();

        if (ref.current === null) {
            return;
        }

        if (dragData.current.dstNodeId !== undefined &&
            (dragData.current.dstNodeId !== id || typeof dragData.current.target === "number")
        ) {
            return;
        }

        const pos = { x: event.clientX, y: event.clientY };
        const rect = ref.current.getBoundingClientRect();
        const region = calculateRegionPercent(pos, rect);

        event.dataTransfer.dropEffect = "move";

        dragData.current.dstNodeId = id;
        dragData.current.target = region;

        const newIndicatorProps = {
            visible: true,
            rect: calculateRegionRect(rect, region),
        };
        setIndicatorProps(newIndicatorProps);
    }

    function onDragLeave(event: React.DragEvent) {
        event.preventDefault();
        dragData.current.dstNodeId = undefined;
    }

    const tabElements: React.ReactNode[] = [];
    const tabContentElements: React.ReactNode[] = [];
    for (let i = 0; i < children.length; i++) {
        const selected = children[i].id === selectedTabId;
        tabElements.push(
            <DockTab
                key={i}
                data={children[i]}
                index={i}
                parentId={id!}
                selected={selected}
            />);
        tabContentElements.push(
            <DockContent key={i} selected={selected}>{children[i].content}</DockContent>
        );
    }

    return (
        <div
            ref={ref}
            className={classes.panel}
            style={{ flexGrow: weight }}
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
        >
            <DockNav parentId={id}>{tabElements}</DockNav>
            {tabContentElements}
        </div>
    );
};

export function DockNav({ parentId, children }: PropsWithChildren<{ parentId?: string }>) {
    const { dragData, setIndicatorProps } = useDock();
    const ref = useRef<HTMLDivElement>(null)

    function onDragEnter(event: React.DragEvent) {
        if(dragData.current.srcNodeId === undefined) {
            return;
        }
        event.preventDefault();

        event.dataTransfer.dropEffect = "move";
    }

    function onDragOver(event: React.DragEvent) {
        if (dragData.current.srcNodeId === undefined) {
            return;
        }
        event.preventDefault();

        if (ref.current === null) {
            return;
        }

        const rect = ref.current?.getBoundingClientRect();

        let targetIndex = 0;
        let indicatorOffset = ref.current.children[0].getBoundingClientRect().left;
        for (const child of ref.current.children) {
            const chlidRect = child.getBoundingClientRect();
            if (event.clientX > chlidRect.x + chlidRect.width / 2) {
                indicatorOffset = chlidRect.right - 2;
                targetIndex++;
            }
        }

        event.dataTransfer.dropEffect = "move";

        dragData.current.dstNodeId = parentId;
        dragData.current.target = targetIndex;

        const newIndicatorProps = {
            visible: true,
            rect: {
                x: indicatorOffset,
                y: rect.top,
                width: 4,
                height: rect.height,
            }
        }
        setIndicatorProps(newIndicatorProps)
    }

    function onDragLeave(event: React.DragEvent) {
        if (dragData.current.srcNodeId === undefined) {
            return;
        }
        event.preventDefault();

        dragData.current.dstNodeId = undefined;
    }

    function onWheel(event: React.WheelEvent) {
        if (ref.current === null) {
            return;
        }

        const [x, y] = [event.deltaX, event.deltaY];
        const magnitude = x === 0 ? y < 0 ? -30 : 30 : x;

        ref.current.scrollBy({
            left: magnitude
        });
    }

    return (
        <div
            ref={ref}
            className={classes.nav}
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onWheel={onWheel}
        >
            {children}
        </div>
    );
}

export function DockContent({ selected, children }: PropsWithChildren<{ selected: boolean }>) {
    return (
        <div className={classes.content} data-selected={selected}>
            {children}
        </div>
    );
}