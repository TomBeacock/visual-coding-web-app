"use client"

import classes from "./dock-layout.module.css"
import { useDock } from "./dock-provider";
import { DockLayoutData, DockTabData } from "./dock-data";
import { findNodeInLayout } from "./dock-algorithm";

type DockTabProps = {
    data: DockTabData,
    index: number,
    parentId: string,
    selected: boolean,
}

export function DockTab({ data, index, parentId, selected }: DockTabProps) {
    const dock = useDock();

    function onClick() {
        if (selected) {
            return;
        }
        const newLayout = { ...dock.layout } as DockLayoutData;
        const parentNode = findNodeInLayout(newLayout, parentId);
        if (parentNode === null || parentNode.type !== "panel") {
            return;
        }
        parentNode.selectedTabId = data.id;
        dock.setLayout(newLayout);
    }

    function onDragStart(event: React.DragEvent) {
        event.stopPropagation();
        event.dataTransfer.effectAllowed = "move";

        const { current: dragData } = dock.dragData;
        dragData.srcNodeId = parentId;
        dragData.srcTabIndex = index;
    }

    return (
        <button
            className={classes.tab}
            draggable="true"
            onClick={onClick}
            onDragStart={onDragStart}
            data-selected={selected}
        >
            {data.icon}
            <span>{data.label}</span>
        </button>
    );
}