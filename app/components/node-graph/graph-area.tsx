import classes from "./graph-area.module.css"
import { createContext, Dispatch, MutableRefObject, ReactNode, SetStateAction, useContext, useRef, useState } from "react";
import { clamp } from "@/app/lib/clamp";
import { Vector2 } from "@/app/lib/vector2";
import { useProgram } from "../app-provider/app-provider";
import { GraphNode } from "./graph-node/graph-node";
import { GraphLink } from "./graph-link/graph-link";
import { addNode, findDefinition } from "@/app/lib/program/program-algorithm";
import { GraphLinkIndicator, GraphLinkIndicatorProps } from "./graph-link/graph-link-indicator";
import { Node, TypedPin, VariableType } from "@/app/lib/program/program-data";
import { Menu, MenuDivider, MenuItem, MenuSub } from "../menu/menu";
import {
    IconClipboard,
    IconPlus,
} from "@tabler/icons-react";
import { std, stdCategories } from "@/app/lib/program/program-std";
import { camelCaseToWords, getIcon } from "@/app/lib/program/program-util";

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
    const position = useRef(Vector2.zero());
    const scale = useRef(1);
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
        if (
            viewportRef.current === null || areaRef.current === null ||
            position.current === null || scale.current === null || dragOrigin.current === null) {
            return;
        }

        const pointerPos = new Vector2(event.clientX, event.clientY);
        const offset = pointerPos.clone().sub(dragOrigin.current);
        position.current.add(offset);
        dragOrigin.current = pointerPos;

        updateTransform();
    }

    function onWindowPointerUp() {
        document.documentElement.classList.remove("move-cursor");
        window.removeEventListener("pointermove", onWindowPointerMove);
        window.removeEventListener("pointerup", onWindowPointerUp);
    }

    function onWheel(event: React.WheelEvent) {
        if (position.current === null ||
            scale.current === null) {
            return;
        }

        const pointerPos = new Vector2(event.clientX, event.clientY);
        const origin = transformScreenPointToGraph(pointerPos);

        // Change zoom on mouse wheel
        scale.current = clamp(scale.current + event.deltaY * -0.001, 0.1, 3.0);

        // Adjust position to zoom based on pointer position
        const newOrigin = transformScreenPointToGraph(pointerPos);
        const offset = newOrigin.sub(origin).mulScalar(scale.current);
        position.current.add(offset);

        updateTransform();
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

    function updateTransform() {
        if (viewportRef.current === null ||
            areaRef.current === null ||
            position.current === null ||
            scale.current === null
        ) {
            return;
        }

        const halfGridSize = gridSize * scale.current * 0.5;
        const bgPos = position.current.clone().addScalar(halfGridSize);

        viewportRef.current.style.setProperty("--grid-scale", `${scale.current}`);
        viewportRef.current.style.backgroundPosition = `${bgPos.x}px ${bgPos.y}px`;
        areaRef.current.style.left = `${position.current.x}px`;
        areaRef.current.style.top = `${position.current.y}px`;
        areaRef.current.style.scale = `${scale.current}`;
    }

    function snapPointToGrid(point: Vector2) {
        point.x = Math.round(point.x / gridSize) * gridSize;
        point.y = Math.round(point.y / gridSize) * gridSize;
    }

    function transformScreenPointToGraph(point: Vector2) {
        if (viewportRef.current === null ||
            position.current === null ||
            scale.current === null
        ) {
            return point.clone();
        }
        const rect = viewportRef.current.getBoundingClientRect();
        // Transform relative to viewport
        const transformedPoint = point.clone().sub(new Vector2(rect.left, rect.top));
        // Transform relative to graph
        transformedPoint.divScalar(scale.current).sub(position.current.clone().divScalar(scale.current));
        return transformedPoint;
    }

    function onCreateNode(name: string) {
        let p = Vector2.zero();
        if (menuPosition !== null) {
            p = transformScreenPointToGraph(menuPosition);
            snapPointToGrid(p);
        }

        const newProgram = { ...program };
        const newNode: Node = (function () {
            switch (name) {
                case "boolean": return { id: "", x: p.x, y: p.y, type: "constant", value: false };
                case "number": return { id: "", x: p.x, y: p.y, type: "constant", value: 0 };
                case "string": return { id: "", x: p.x, y: p.y, type: "constant", value: "" };
                default: return { id: "", x: p.x, y: p.y, type: "function", lib: "std", func: name };
            }
        })();
        addNode(newProgram, selectedFunction, newNode);
        setProgram(newProgram);

        setMenuPosition(null);
    }

    // Generate links and node from program
    const nodes: ReactNode[] = [];
    const links: ReactNode[] = [];

    const func = program.functions.get(selectedFunction);
    if (func !== undefined) {
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
                y2={dstNode.y + gridSize * (dstDef.outputs.size + dst.index + 1.5)}
                color={color}
            />);
            key++;
        }
    }

    // Generate add node menu
    const categorisedFuncs = new Map<string, ReactNode[]>();
    for (const def of std.values()) {
        let category = categorisedFuncs.get(def.category);
        if (category === undefined) {
            category = categorisedFuncs.set(def.category, []).get(def.category);
        }
        category?.push(
            <MenuItem
                key={def.name}
                label={camelCaseToWords(def.name)}
                icon={getIcon(def.icon)}
                onClick={() => onCreateNode(def.name)}
            />
        );
    }

    const addNodeMenu: ReactNode[] = [];
    for (const [category, nodes] of categorisedFuncs) {
        const def = stdCategories.get(category) || { name: "default", icon: "default" };
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
                    "--grid-scale": scale.current,
                    "--node-cell-width": nodeDefaultWidth,
                    backgroundPosition: `${gridSize / 2}px ${gridSize / 2}px`
                }}
                onPointerDown={onPointerDown}
                onWheel={onWheel}
                onContextMenu={onContextMenu}
            >
                <div
                    ref={areaRef}
                    className={classes.area}
                    style={{
                        scale: 1,
                        left: 0,
                        top: 0,
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