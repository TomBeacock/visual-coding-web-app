import { useContext } from "react";
import { DockLayoutContext } from "./dock-layout";
import { DockLayoutData, DockTabData } from "./dock-data";
import { findNodeInLayout } from "@/app/lib/dock-algorithm";
import classes from "./dock-layout.module.css"

type DockTabProps = {
    data: DockTabData,
    index: number,
    parentId: string,
    selected: boolean,
}

export function DockTab({ data, index, parentId, selected }: DockTabProps) {
    const context = useContext(DockLayoutContext);

    function onClick() {
        if (selected) {
            return;
        }
        const newLayout = { ...context.layout } as DockLayoutData;
        const parentNode = findNodeInLayout(newLayout, parentId);
        if (parentNode === null || parentNode.type !== "panel") {
            return;
        }
        parentNode.selectedTabId = data.id;
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