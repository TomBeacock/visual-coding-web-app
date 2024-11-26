import classes from "./graph-area.module.css"
import { createContext, Dispatch, MutableRefObject, ReactNode, SetStateAction, useContext, useRef, useState } from "react";
import { clamp } from "@/app/lib/clamp";
import { Vector2 } from "@/app/lib/vector2";
import { useProgram } from "../app-provider/app-provider";
import { GraphNode } from "./graph-node/graph-node";
import { GraphLink } from "./graph-link/graph-link";
import { addNode, createNode, findDefinition } from "@/app/lib/program/program-algorithm";
import { GraphLinkIndicator, GraphLinkIndicatorProps } from "./graph-link/graph-link-indicator";
import { NodeDefinition, TypedPin, VariableType } from "@/app/lib/program/program-data";
import { Menu, MenuDivider, MenuItem, MenuSub } from "../menu/menu";
import {
    IconClipboard,
    IconPlus,
} from "@tabler/icons-react";
import {
    constantDefinitions,
    operationDefinitions,
    controlFlowDefinitions,
    coreCategories
} from "@/app/lib/program/program-core";
import { camelCaseToWords, getIcon } from "@/app/lib/program/program-util";
import { transformPoint } from "@/app/lib/transformations";

declare module "react" {
    interface CSSProperties {
        "--grid-size"?: string;
        "--grid-scale"?: number;
        "--node-cell-width"?: number;
    }
}

type LinkDragData = {
    origin: Vector2,
    varType: VariableType,
    isDragging: boolean,
    isSnapping: boolean,
    pin?: TypedPin,
}

type GraphContextType = {
    linkIndicatorProps: GraphLinkIndicatorProps,
    setLinkIndicatorProps: Dispatch<SetStateAction<GraphLinkIndicatorProps>>,
    linkDragData: MutableRefObject<LinkDragData>,
    gridSize: number,
    nodeCellWidth: number,
    snapPointToGrid: (point: Vector2) => void,
    transformScreenPointToGraph: (point: Vector2) => Vector2,
}

const GraphContext = createContext({} as GraphContextType);

export const useGraph = () => useContext(GraphContext);

export function GraphArea() {
    const { program, setProgram, selectedFunction } = useProgram();
    const func = program.functions.get(selectedFunction);
    if (func === undefined) {
        return <></>;
    }

    const [linkIndicatorProps, setLinkIndicatorProps] = useState({
        visible: false,
        link: { x1: 0, y1: 0, x2: 0, y2: 0, color: "" },
    } as GraphLinkIndicatorProps);

    const linkDragData = useRef({
        origin: Vector2.zero(),
        varType: "exec",
        isDragging: false,
        isSnapping: false,
    } as LinkDragData);

    const [menuPosition, setMenuPosition] = useState<Vector2 | null>(null);

    const viewportRef = useRef<HTMLDivElement>(null);
    const areaRef = useRef<HTMLDivElement>(null);
    const dragOrigin = useRef(Vector2.zero());

    const gridSize = 32;
    const nodeDefaultWidth = 6;

    function onPointerDown(event: React.PointerEvent) {
        if (dragOrigin.current === null || event.button !== 1) {
            return;
        }

        event.preventDefault();
        document.documentElement.classList.add("move-cursor");

        dragOrigin.current = new Vector2(event.clientX, event.clientY);

        window.addEventListener("pointermove", onWindowPointerMove);
        window.addEventListener("pointerup", onWindowPointerUp);
    }

    function onWindowPointerMove(event: PointerEvent) {
        if (viewportRef.current === null || areaRef.current === null ||
            func === undefined || dragOrigin.current === null) {
            return;
        }

        const pointerPos = new Vector2(event.clientX, event.clientY);
        const offset = pointerPos.clone().sub(dragOrigin.current);
        dragOrigin.current = pointerPos;

        const newProgram = { ...program };
        const newFunc = newProgram.functions.get(selectedFunction);
        if (newFunc === undefined) {
            return;
        }
        newFunc.position.add(offset);
        setProgram(newProgram);
    }

    function onWindowPointerUp() {
        document.documentElement.classList.remove("move-cursor");
        window.removeEventListener("pointermove", onWindowPointerMove);
        window.removeEventListener("pointerup", onWindowPointerUp);
    }

    function onWheel(event: React.WheelEvent) {
        if (func === undefined) {
            return;
        }

        // Cache original origin
        const pointerPos = screenPointToViewport(new Vector2(event.clientX, event.clientY));
        const origin = transformPoint(pointerPos, func.position, func.scale);

        const newProgram = { ...program };
        const newFunc = newProgram.functions.get(selectedFunction);
        if (newFunc === undefined) {
            return;
        }
        // Change zoom on mouse wheel
        newFunc.scale = clamp(func.scale + event.deltaY * -0.001, 0.1, 3.0);

        // Adjust position to zoom based on pointer position
        const newOrigin = transformPoint(pointerPos, newFunc.position, newFunc.scale);
        const offset = newOrigin.sub(origin).mulScalar(newFunc.scale);
        newFunc.position.add(offset);

        setProgram(newProgram);
    }

    function onContextMenu(event: React.MouseEvent) {
        if (event.defaultPrevented) {
            return;
        }
        event.preventDefault();
        setMenuPosition(new Vector2(event.clientX, event.clientY));
        window.addEventListener("pointerdown", onWindowPointerDown);
    }

    function onWindowPointerDown() {
        setMenuPosition(null);
        window.removeEventListener("pointerdown", onWindowPointerDown);
    }

    function snapPointToGrid(point: Vector2) {
        point.x = Math.round(point.x / gridSize) * gridSize;
        point.y = Math.round(point.y / gridSize) * gridSize;
    }
    
    function screenPointToViewport(point: Vector2) {
        if (viewportRef.current === null) {
            return point.clone();
        }
        const rect = viewportRef.current.getBoundingClientRect();
        return point.clone().sub(new Vector2(rect.left, rect.top));
    }

    function transformScreenPointToGraph(point: Vector2) {
        if (func === undefined) {
            return point.clone();
        }
        return transformPoint(screenPointToViewport(point), func.position, func.scale);
    }

    function onCreateNode(def: NodeDefinition) {
        let p = Vector2.zero();
        if (menuPosition !== null && func !== undefined) {
            p = transformPoint(screenPointToViewport(menuPosition), func.position, func.scale);
            snapPointToGrid(p);
        }

        const newProgram = { ...program };
        addNode(newProgram, selectedFunction, createNode(def, p.x, p.y));
        setProgram(newProgram);

        setMenuPosition(null);
    }

    // Generate links and node from program
    const nodes: ReactNode[] = [];
    const links: ReactNode[] = [];

    for (const node of func.nodes) {
        nodes.push(<GraphNode key={node.id} node={node} />);
    }

    let key = 0;
    for (const { src, dst } of func.links) {
        const srcNode = func.nodes.find((node) => node.id === src.nodeId);
        const dstNode = func.nodes.find((node) => node.id === dst.nodeId);
        if (srcNode === undefined || dstNode === undefined) {
            continue;
        }
        const srcDef = findDefinition(srcNode);
        if (srcDef === undefined) {
            continue;
        }
        const dstDef = findDefinition(dstNode);
        if (dstDef === undefined) {
            continue;
        }
        const type = [...dstDef.inputs][dst.index][1];
        const color = `var(--type-${type}-color)`;
        const width = srcDef.widthOverride || nodeDefaultWidth;
        links.push(<GraphLink
            key={key}
            x1={srcNode.x + gridSize * (width - 0.5)}
            y1={srcNode.y + gridSize * (src.index + (srcNode.type === "constant" ? 0.5 : 1.5))}
            x2={dstNode.x + gridSize * 0.5}
            y2={dstNode.y + gridSize * (dstDef.outputs.length + dst.index + 1.5)}
            color={color}
        />);
        key++;
    }

    // Generate add node menu
    const categorisedFuncs = new Map<string, ReactNode[]>();
    const addToNodeMenu = (def: NodeDefinition) => {
        let category = categorisedFuncs.get(def.category);
        if (category === undefined) {
            category = categorisedFuncs.set(def.category, []).get(def.category);
        }
        category?.push(
            <MenuItem
                key={def.name}
                label={camelCaseToWords(def.name)}
                icon={getIcon(def.icon)}
                onClick={() => onCreateNode(def)}
            />
        );
    };
    for (const def of constantDefinitions.values()) {
        addToNodeMenu(def);
    }
    for (const def of controlFlowDefinitions.values()) {
        addToNodeMenu(def);
    }
    for (const def of operationDefinitions.values()) {
        addToNodeMenu(def);
    }

    const addNodeMenu: ReactNode[] = [];
    for (const [category, nodes] of categorisedFuncs) {
        const def = coreCategories.get(category) || { name: "default", icon: "default" };
        addNodeMenu.push(
            <MenuSub
                key={category}
                label={camelCaseToWords(category)}
                icon={getIcon(def.icon)}
            >
                {nodes}
            </MenuSub>
        );
    }


    const halfGridSize = gridSize * func.scale * 0.5;
    const bgPos = func.position.clone().addScalar(halfGridSize);

    return (
        <GraphContext.Provider
            value={{
                linkIndicatorProps, setLinkIndicatorProps,
                linkDragData,
                gridSize,
                nodeCellWidth: nodeDefaultWidth,
                snapPointToGrid,
                transformScreenPointToGraph
            }}>
            <div
                ref={viewportRef}
                className={classes.viewport}
                style={{
                    "--grid-size": `${gridSize}px`,
                    "--grid-scale": func.scale,
                    "--node-cell-width": nodeDefaultWidth,
                    backgroundPosition: `${bgPos.x}px ${bgPos.y}px`,
                }}
                onPointerDown={onPointerDown}
                onWheel={onWheel}
                onContextMenu={onContextMenu}
            >
                <div
                    ref={areaRef}
                    className={classes.area}
                    style={{
                        left: func.position.x,
                        top: func.position.y,
                        scale: func.scale,
                    }}
                >
                    <GraphLinkIndicator {...linkIndicatorProps} />
                    <div>
                        {links}
                    </div>
                    <div>
                        {nodes}
                    </div>
                </div>
                <Menu
                    x={menuPosition === null ? 0 : menuPosition.x}
                    y={menuPosition === null ? 0 : menuPosition.y}
                    position="right"
                    visible={menuPosition !== null}
                >
                    <MenuItem label="Paste" icon={<IconClipboard />} />
                    <MenuDivider />
                    <MenuSub label="Add Node" icon={<IconPlus />}>
                        {addNodeMenu}
                    </MenuSub>
                </Menu>
            </div>
        </GraphContext.Provider>
    );
}