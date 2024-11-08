'use client'

import { ForwardedRef, forwardRef, PropsWithChildren, useContext, useImperativeHandle, useRef } from "react";
import { DockLayoutData, DockPanelData } from "./dock-data";
import { DockLayoutContext } from "./dock-layout";
import { calculateRegionPercent, calculateRegionRect, findNodeInLayout } from "./dock-algorithm";

export const DockPanel = forwardRef(function DockPanel({ data: { id, weight, selectedTabId, children } }: { data: DockPanelData }, ref: ForwardedRef<HTMLDivElement>) {
    const selfRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => selfRef.current!);

    const context = useContext(DockLayoutContext);

    function onDragEnter(event: React.DragEvent) {
        event.preventDefault();
    }

    function onDragOver(event: React.DragEvent) {
        event.preventDefault();


        if (selfRef.current === null) {
            return;
        }

        const { current: dragData } = context.dragData;
        if (dragData.dstNodeId !== undefined && (dragData.dstNodeId !== id || typeof dragData.target === "number")) {
            return;
        }

        const pos = { x: event.clientX, y: event.clientY };
        const rect = selfRef.current.getBoundingClientRect();
        const region = calculateRegionPercent(pos, rect);

        event.dataTransfer.dropEffect = "move";

        dragData.dstNodeId = id;
        dragData.target = region;

        const newIndicatorProps = {
            visible: true,
            rect: calculateRegionRect(rect, region),
        };
        context.setIndicatorProps(newIndicatorProps);
    }

    function onDragLeave(event: React.DragEvent) {
        event.preventDefault();

        const { current: dragData } = context.dragData;
        dragData.dstNodeId = undefined;
    }

    let tabElements: React.ReactNode[] = [];
    let tabContentElements: React.ReactNode[] = [];
    for (let i = 0; i < children.length; i++) {
        const selected = children[i].id === selectedTabId;
        tabElements.push(
            <DockTab
                key={i}
                id={children[i].id!}
                index={i}
                parentId={id!}
                selected={selected}
            >
                {children[i].tabInner}
            </DockTab>);
        tabContentElements.push(
            <DockContent key={i} selected={selected}>{children[i].tabContent}</DockContent>
        );
    }

    return (
        <div
            ref={selfRef}
            className="dock-panel basis-0 rounded-lg grid grid-rows-[auto_1fr] min-w-0 min-h-0"
            style={{ flexGrow: weight }}
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
        >
            <DockNav parentId={id}>{tabElements}</DockNav>
            {tabContentElements}
        </div>
    );
});

export function DockNav({ parentId, children }: PropsWithChildren<{ parentId?: string }>) {
    const context = useContext(DockLayoutContext);
    const ref = useRef<HTMLDivElement>(null)

    function onDragEnter(event: React.DragEvent) {
        event.preventDefault();

        event.dataTransfer.dropEffect = "move";
    }

    function onDragOver(event: React.DragEvent) {
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
                indicatorOffset = chlidRect.right;
                targetIndex++;
            }
        }

        event.dataTransfer.dropEffect = "move";

        const { current: dragData } = context.dragData;
        dragData.dstNodeId = parentId;
        dragData.target = targetIndex;

        const newIndicatorProps = {
            visible: true,
            rect: {
                x: indicatorOffset - 4,
                y: rect.top,
                width: 8,
                height: rect.height,
            }
        }
        context.setIndicatorProps(newIndicatorProps)
    }

    function onDragLeave(event: React.DragEvent) {
        event.preventDefault();

        const { current: dragData } = context.dragData;
        dragData.dstNodeId = undefined;
    }

    function onWheel(event: React.WheelEvent) {
        if(ref.current === null) {
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
            className="dock-nav flex flex-row overflow-x-hidden"
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onWheel={onWheel}
        >
            {children}
        </div>
    );
}

type DockTabProps = PropsWithChildren<{
    id: string,
    index: number,
    parentId: string,
    selected: boolean,
}>

export function DockTab({ id, index, parentId, selected, children }: DockTabProps) {
    const context = useContext(DockLayoutContext);

    function onClick() {
        if(selected) {
            return;
        }
        const newLayout = { ...context.layout } as DockLayoutData;
        const parentNode = findNodeInLayout(newLayout, parentId);
        if (parentNode === null || parentNode.type !== "panel") {
            return;
        }
        parentNode.selectedTabId = id;
        context.setLayout(newLayout);
    }

    function onDragStart(event: React.DragEvent) {
        event.stopPropagation();
        event.dataTransfer.effectAllowed = "move";

        const { current: dragData } = context.dragData;
        dragData.srcNodeId = parentId;
        dragData.srcTabIndex = index;
    }

    return (
        <button
            className={`dock-tab flex flex-row items-center gap-x-1 text-nowrap${selected ? " selected" : ""}`}
            draggable="true"
            onClick={onClick}
            onDragStart={onDragStart}
        >
            {children}
        </button>
    );
}

export function DockContent({ selected, children }: PropsWithChildren<{ selected: boolean }>) {
    return (
        <div className={`dock-content${selected ? " selected" : ""}`}>
            {children}
        </div>
    );
}