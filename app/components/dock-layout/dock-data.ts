export type DockNodeBaseData = {
    id?: string
    weight?: number
}

export type DockBoxData = {
    type: "box";
    direction: Direction,
    children: DockNodeData[],
} & DockNodeBaseData;

export type DockPanelData = {
    type: "panel",
    selectedTabId?: string,
    children: DockTabData[],
} & DockNodeBaseData;

export type DockTabData = {
    id?: string,
    icon?: React.ReactNode,
    label: string,
    content: React.ReactNode,
};

export type DockNodeData = DockBoxData | DockPanelData;

export type DockLayoutData = {
    root: DockNodeData | null,
}

export type Direction = "row" | "column";
export type Region = "left" | "right" | "top" | "bottom" | "center";

export type DockDragData = {
    srcNodeId?: string,
    srcTabIndex: number,
    dstNodeId?: string | "dock-root",
    target: Region | number,
}