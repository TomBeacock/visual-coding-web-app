import { DockBoxData, DockLayoutData, DockNodeData, DockPanelData, DockTabData, Direction, Region } from "./dock-data";

let nodeIdCounter: number = 0;

function nextNodeId(): string {
    ++nodeIdCounter;
    return `dock-node-${nodeIdCounter}`;
}

let tabIdCounter: number = 0;

function nextTabId(): string {
    ++tabIdCounter;
    return `dock-tab-${tabIdCounter}`;
}

export function validateLayout(layout: DockLayoutData) {
    function validateNode(node: DockNodeData) {
        if (node.id === undefined) {
            node.id = nextNodeId();
        }
        if (node.weight === undefined) {
            node.weight = 1;
        }

        if (node.type === "panel") {
            validatePanel(node);
        }
        else {
            validateBox(node);
        }
    }

    function validatePanel(panel: DockPanelData) {
        // Validate tab ids
        for (const child of panel.children) {
            if (child.id === undefined) {
                child.id = nextTabId();
            }
        }

        // Validate active tab id
        if(panel.selectedTabId === undefined) {
            panel.selectedTabId = panel.children[0].id;
        }
    }

    function validateBox(box: DockBoxData) {
        for (const child of box.children) {
            validateNode(child);
        }
    }

    if (layout.root === null) {
        return;
    }
    validateNode(layout.root);
}

export function findNodeInLayout(layout: DockLayoutData, nodeId: string): DockNodeData | null {
    if (layout.root === null) {
        return null;
    }
    return findChildInNode(layout.root, nodeId);
}

export function findChildInNode(parent: DockNodeData, childId: string): DockNodeData | null {
    if (parent.id === childId) {
        return parent;
    }
    if (parent.type === "box") {
        for (const child of parent.children) {
            const foundChild = findChildInNode(child, childId);
            if (foundChild !== null) {
                return foundChild;
            }
        }
    }
    return null;
}

export function findParentInLayout(layout: DockLayoutData, id: string): DockBoxData | "dock-root" | null {
    if (layout.root === null) {
        return null;
    }

    if (layout.root.id === id) {
        return "dock-root";
    }

    function findParentInNode(node: DockNodeData): DockBoxData | null {
        if (node.type === "panel") {
            return null;
        }
        else {
            for (const child of node.children) {
                if (child.id == id) {
                    return node;
                }
                const foundParent = findParentInNode(child);
                if (foundParent !== null) {
                    return foundParent;
                }
            }
            return null;
        }
    }
    return findParentInNode(layout.root);
}

function findChildIndex(parentNode: DockNodeData, childId: string) {
    return parentNode.children.findIndex((child) => child.id === childId);
}

export function setWeightInLayout(layout: DockLayoutData, id: string, weight: number) {
    const node = findNodeInLayout(layout, id);
    if (node === null) {
        return;
    }
    node.weight = weight;
}

export function addNodeInLayout(layout: DockLayoutData, node: DockNodeData, region: Region) {

}

export function removeNodeInLayout(layout: DockLayoutData, id: string) {
    const parentNode = findParentInLayout(layout, id);
    if (parentNode === null) {
        return;
    }
    else if (parentNode === "dock-root") {
        layout.root = null;
    }
    else {
        const index = findChildIndex(parentNode, id);
        parentNode.children.splice(index, 1);

        // Collapse box if it only has one child
        if (parentNode.children.length === 1) {
            replaceNodeInLayout(layout, parentNode, parentNode.children[0]);
        }
    }
}

function replaceNodeInLayout(layout: DockLayoutData, oldNode: DockNodeData, newNode: DockNodeData) {
    const parentNode = findParentInLayout(layout, oldNode.id!);
    if (parentNode === null) {
        return;
    }
    else if (parentNode === "dock-root") {
        layout.root = newNode;
    }
    else {
        const index = findChildIndex(parentNode, oldNode.id!);
        newNode.weight = oldNode.weight;
        parentNode.children.splice(index, 1, newNode);
    }
}

export function addNodeToBoxInLayout(layout: DockLayoutData, id: string, index: number, node: DockNodeData) {

}

export function addTabInLayout(layout: DockLayoutData, panelId: string, tab: DockTabData, index?: number) {
    const node = findNodeInLayout(layout, panelId);
    if (node === null || node.type !== "panel") {
        console.error(`Failed to add tab, invalid id: ${panelId}`);
        return;
    }
    node.selectedTabId = tab.id;
    if(index === undefined) {
        node.children.push(tab);
    }
    else {
        node.children.splice(index, 0, tab);
    }
}

export function removeTabInLayout(layout: DockLayoutData, panelId: string, index: number) {
    const node = findNodeInLayout(layout, panelId);
    if (node === null || node.type !== "panel") {
        console.error(`Failed to remove tab, invalid id: ${panelId}`);
        return;
    }
    const wasSelected = node.selectedTabId === node.children[index].id;
    node.children.splice(index, 1);

    // Remove empty panel
    if (node.children.length === 0) {
        removeNodeInLayout(layout, panelId);
    }
    // Select new tab from remaining
    else if(wasSelected) {
        const selectedIndex = index === 0 ? 0 : index - 1;
        node.selectedTabId = node.children[selectedIndex].id;
    }
}

export function moveTabInLayout(
    layout: DockLayoutData,
    srcId: string,
    srcIndex: number,
    dstId: string | "dock-root",
    target: Region | number = "center"
) {
    if (layout.root === null) {
        return;
    }

    const srcNode = findNodeInLayout(layout, srcId);
    if (srcNode === null || srcNode?.type !== "panel") {
        return;
    }

    // Optimization for when no move is required
    if (srcId === dstId && srcNode.children.length === 1) {
        return;
    }

    const tabData = srcNode.children[srcIndex];

    removeTabInLayout(layout, srcId, srcIndex);

    // Add tab to panel
    if (typeof target === "number" || target === "center") {
        const index = target === "center" ? undefined : target;
        addTabInLayout(layout, dstId, tabData, index);
    }
    // Add tab to box
    else {
        const direction: Direction = target === "left" || target === "right" ? "row" : "column";
        const insertBefore = target === "left" || target === "top";

        if (dstId === "dock-root") {
            const rootNode = layout.root;
            if(rootNode.type === "box") {
                // Add node to existing box
                if (rootNode.direction === direction) {
                    const newPanel: DockPanelData = {
                        id: nextNodeId(),
                        weight: 1,
                        type: "panel",
                        selectedTabId: tabData.id,
                        children: [tabData],
                    }
                    const insertIndex = insertBefore ? 0 : rootNode.children.length;
                    rootNode.children.splice(insertIndex, 0, newPanel);
                }
                // Create new box
                else {
                    const newPanel: DockPanelData = {
                        id: nextNodeId(),
                        weight: 1,
                        type: "panel",
                        selectedTabId: tabData.id,
                        children: [tabData],
                    }

                    const newBox: DockBoxData = {
                        id: nextNodeId(),
                        weight: 1,
                        type: "box",
                        direction: direction,
                        children: insertBefore ? [newPanel, rootNode] : [rootNode, newPanel],
                    }
                    rootNode.weight = 1;
                    layout.root = newBox;
                }
            }
            // Create new box
            else {
                const newPanel: DockPanelData = {
                    id: nextNodeId(),
                    weight: 1,
                    type: "panel",
                    selectedTabId: tabData.id,
                    children: [tabData],
                }

                const newBox: DockBoxData = {
                    id: nextNodeId(),
                    weight: 1,
                    type: "box",
                    direction: direction,
                    children: insertBefore ? [newPanel, rootNode] : [rootNode, newPanel],
                }
                rootNode.weight = 1;
                layout.root = newBox;
            }
        }
        else {
            const parentNode = findParentInLayout(layout, dstId);
            if (parentNode === null) {
                return;
            }
            else if (parentNode === "dock-root") {
                const dstNode = findNodeInLayout(layout, dstId);
                if (dstNode === null) {
                    return;
                }
                const newPanel: DockPanelData = {
                    id: nextNodeId(),
                    weight: 1,
                    type: "panel",
                    selectedTabId: tabData.id,
                    children: [tabData],
                }

                const newBox: DockBoxData = {
                    id: nextNodeId(),
                    weight: 1,
                    type: "box",
                    direction: direction,
                    children: insertBefore ? [newPanel, dstNode] : [dstNode, newPanel],
                }
                dstNode.weight = 1;
                layout.root = newBox;
            }
            else {
                const dstNode = findChildInNode(parentNode, dstId);
                if (dstNode === null) {
                    return;
                }
                const dstIndex = findChildIndex(parentNode, dstId);

                // Add node to existing box
                if (parentNode.direction === direction) {
                    const halfWeight = dstNode.weight! / 2;
                    const newPanel: DockPanelData = {
                        id: nextNodeId(),
                        weight: halfWeight,
                        type: "panel",
                        selectedTabId: tabData.id,
                        children: [tabData],
                    }
                    dstNode.weight = halfWeight;
                    const insertIndex = dstIndex + (insertBefore ? 0 : 1);
                    parentNode.children.splice(insertIndex, 0, newPanel);
                }
                // Create new box
                else {
                    const newPanel: DockPanelData = {
                        id: nextNodeId(),
                        weight: 1,
                        type: "panel",
                        selectedTabId: tabData.id,
                        children: [tabData],
                    }

                    const newBox: DockBoxData = {
                        id: nextNodeId(),
                        weight: dstNode.weight,
                        type: "box",
                        direction: direction,
                        children: insertBefore ? [newPanel, dstNode] : [dstNode, newPanel],
                    }
                    dstNode.weight = 1;
                    parentNode.children.splice(dstIndex, 1, newBox);
                }
            }
        }
    }
}

export function calculateRegionPercent(pos: { x: number, y: number }, rect: DOMRect, distance: number = 0.25) {
    const offset = {
        left: (pos.x - rect.x) / rect.width,
        right: (rect.right - pos.x) / rect.width,
        top: (pos.y - rect.y) / rect.height,
        bottom: (rect.bottom - pos.y) / rect.height,
    };

    return calculateRegion(offset, distance);
}

export function calculateRegionAbsolute(pos: { x: number, y: number }, rect: DOMRect, distance: number = 8) {
    const offset = {
        left: pos.x - rect.x,
        right: rect.width - (pos.x - rect.x),
        top: pos.y - rect.y,
        bottom: rect.height - (pos.y - rect.y),
    };

    return calculateRegion(offset, distance);
}

function calculateRegion(offset: { left: number, right: number, top: number, bottom: number }, distance: number) {
    let region: Region = "center";
    if (offset.left < distance) {
        if (offset.top < distance) {
            region = offset.left < offset.top ? "left" : "top";
        }
        else if (offset.bottom < distance) {
            region = offset.left < offset.bottom ? "left" : "bottom";
        }
        else {
            region = "left";
        }
    }
    else if (offset.right < distance) {
        if (offset.top < distance) {
            region = offset.right < offset.top ? "right" : "top";
        }
        else if (offset.bottom < distance) {
            region = offset.right < offset.top ? "right" : "bottom";
        }
        else {
            region = "right";
        }
    }
    else if (offset.top < distance) {
        region = "top";
    }
    else if (offset.bottom < distance) {
        region = "bottom";
    }
    return region;
}

export function calculateRegionRect(rect: DOMRect, region: Region) {
    const indicatorRect = {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
    }
    if (region === "right") {
        indicatorRect.x += rect.width / 2;
    }
    else if (region === "bottom") {
        indicatorRect.y += rect.height / 2;
    }
    if (region === "left" || region === "right") {
        indicatorRect.width /= 2;
    }
    else if (region === "top" || region === "bottom") {
        indicatorRect.height /= 2;
    }
    return indicatorRect;
}