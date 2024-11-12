"use client"

import { createContext, Dispatch, MutableRefObject, SetStateAction, useRef, useState } from "react";
import { DockBox } from "./dock-box";
import { DockPanel } from "./dock-panel";
import { DockDragData, DockLayoutData, DockNodeData } from "./dock-data";
import { calculateRegionAbsolute, validateLayout, calculateRegionRect, moveTabInLayout } from "../../lib/dock-algorithm";
import classes from "./dock-layout.module.css";

type DockIndicatorProps = {
    visible: boolean,
    rect: {
        x: number,
        y: number,
        width: number,
        height: number,
    }
}

function DockIndicator({ visible, rect }: DockIndicatorProps) {
    return (
        <div
            className={classes.indicator}
            data-visible={visible}
            style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}
        >
        </div>
    );
}

export function createDockNode(nodeData: DockNodeData): React.ReactNode {
    if (nodeData.type === "panel") {
        return <DockPanel key={nodeData.id} data={nodeData}></DockPanel>;
    }
    else {
        return <DockBox key={nodeData.id} data={nodeData}></DockBox>;
    }
}

export type DockLayoutContextType = {
    layout: DockLayoutData,
    setLayout: Dispatch<SetStateAction<DockLayoutData>>,
    indicatorProps: DockIndicatorProps,
    setIndicatorProps: Dispatch<SetStateAction<DockIndicatorProps>>,
    dragData: MutableRefObject<DockDragData>,
}

export const DockLayoutContext = createContext<DockLayoutContextType>({
    layout: { root: null },
    setLayout: () => { },
    indicatorProps: { visible: false, rect: { x: 0, y: 0, width: 0, height: 0 } },
    setIndicatorProps: () => { },
    dragData: {
        current: {
            srcNodeId: undefined,
            srcTabIndex: -1,
            dstNodeId: undefined,
            target: "center",
        } as DockDragData
    },
});

type DockLayoutProps = {
    layout: DockLayoutData,
}

export function DockLayout({ layout: initialLayout }: DockLayoutProps) {
    const ref = useRef<HTMLDivElement>(null);
    const dragData = useRef({
        srcNodeId: undefined,
        srcTabIndex: -1,
        dstNodeId: undefined,
        target: "center",
    } as DockDragData);

    validateLayout(initialLayout)
    const [layout, setLayout] = useState(initialLayout);
    const [indicatorProps, setIndicatorProps] = useState({
        visible: false,
        rect: { x: 0, y: 0, width: 0, height: 0 }
    } as DockIndicatorProps);

    function onDragEnter(event: React.DragEvent) {
        event.preventDefault();
    }

    function onDragOver(event: React.DragEvent) {
        event.preventDefault();

        if (ref.current === null) {
            return;
        }
        const pos = { x: event.clientX, y: event.clientY };
        const rect = ref.current.getBoundingClientRect();
        const region = calculateRegionAbsolute(pos, rect);

        if (region === "center") {
            if (dragData.current.dstNodeId === undefined || dragData.current.dstNodeId === "dock-root") {
                event.dataTransfer.dropEffect = "none";

                dragData.current.dstNodeId = undefined;

                const newIndicatorProps = {
                    ...indicatorProps,
                    visible: false,
                }
                setIndicatorProps(newIndicatorProps);
            }
            return;
        }

        event.dataTransfer.dropEffect = "move";

        dragData.current.dstNodeId = "dock-root";
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

        const newIndicatorProps = {
            ...indicatorProps,
            visible: false,
        };
        setIndicatorProps(newIndicatorProps);
    }

    function onDrop(event: React.DragEvent) {
        event.preventDefault();

        if (layout === null) {
            return;
        }

        // Move tab to new position
        const newLayout: DockLayoutData = { ...layout };
        moveTabInLayout(
            newLayout,
            dragData.current.srcNodeId!,
            dragData.current.srcTabIndex,
            dragData.current.dstNodeId!,
            dragData.current.target
        );
        setLayout(newLayout);

        // Clear drag data
        dragData.current.srcNodeId = undefined;

        // Hide indicator
        const newIndicatorProps = {
            ...indicatorProps,
            visible: false,
        };
        setIndicatorProps(newIndicatorProps);
    }

    return (
        <DockLayoutContext.Provider
            value={{
                layout, setLayout,
                indicatorProps, setIndicatorProps,
                dragData: dragData,
            }}
        >
            <div
                ref={ref}
                className={classes.layout}
                onDragEnter={onDragEnter}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
            >
                {layout.root !== null && createDockNode(layout.root)}
                <DockIndicator visible={indicatorProps.visible} rect={indicatorProps.rect} />
            </div>
        </DockLayoutContext.Provider>
    );
}