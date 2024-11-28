import classes from "./graph-area.module.css"
import {
    useContext,
    useRef, 
    useState,
    createContext,
    ReactNode,
    MutableRefObject,
    Dispatch,
    SetStateAction,
    MouseEventHandler,
} from "react";
import { clamp } from "@/app/lib/clamp";
import { Vector2 } from "@/app/lib/vector2";
import { useProgram } from "../app-provider/app-provider";
import { GraphNode } from "./graph-node/graph-node";
import { GraphLink } from "./graph-link/graph-link";
import { GraphLinkIndicator, GraphLinkIndicatorProps } from "./graph-link/graph-link-indicator";
import { Menu, MenuDivider, MenuItem, MenuSub } from "../menu/menu";
import {
    IconClipboard,
    IconPlus,
} from "@tabler/icons-react";
import { Node, TypedPin, PinVarType } from "@/app/lib/program/program-data";
import {
    constantDefinitions,
    coreFunctionDefinitions,
    coreCategories
} from "@/app/lib/program/program-core";
import { addNode, createConstantNode, createCoreFunctionCallNode, findDefinition } from "@/app/lib/program/program-algorithm";
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
    varType: PinVarType,
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
    const dragOrigin = useRef(Vector2.zero());
    
    const func = program.functions.get(selectedFunction);
    if (func === undefined) {
        return <></>;
    }

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

    function onCreateNode(createNode: (x: number, y: number) => Node) {
        let p = Vector2.zero();
        if (menuPosition !== null && func !== undefined) {
            p = transformPoint(screenPointToViewport(menuPosition), func.position, func.scale);
            snapPointToGrid(p);
        }

        const newProgram = { ...program };
        addNode(newProgram, selectedFunction, createNode(p.x, p.y));
        setProgram(newProgram);

        setMenuPosition(null);
    }

    // Generate links and nodes from selected function
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
        const srcDef = findDefinition(program, selectedFunction, srcNode);
        const dstDef = findDefinition(program, selectedFunction, dstNode);
        if(srcDef === undefined || dstDef === undefined) {
            continue;
        }

        let x1 = 0, y1 = 0, y2 = 0;
        let type: PinVarType = "boolean";

        switch(srcDef.type) {
            case "constant":
                x1 = (srcDef.widthOverride || nodeDefaultWidth) - 0.5;
                y1 = 0.5;
                type = srcDef.varType;
                break;
            case "variable":
                x1 = nodeDefaultWidth - 0.5;
                y1 = src.index + 0.5;
                type = srcDef.varType;
                break;
            case "coreFunction":
            case "userFunction":
                x1 = (srcDef.widthOverride || nodeDefaultWidth) - 0.5;
                y1 = src.index + 1.5;
                type = srcDef.outputs[src.index][1];
                break;
        }

        switch(dstDef.type) {
            case "variable":
                y2 = dst.index + 0.5;
                break;
            case "coreFunction":
            case "userFunction":
                y2 = dstDef.outputs.length + dst.index + 1.5;
                break;
        }

        links.push(<GraphLink
            key={key}
            x1={srcNode.x + gridSize * x1}
            y1={srcNode.y + gridSize * y1}
            x2={dstNode.x + gridSize * 0.5}
            y2={dstNode.y + gridSize * y2}
            color={`var(--type-${type}-color)`}
        />);
        key++;
    }

    // Generate add node menu
    const addNodeToMenu = (menu: ReactNode[], name: string, icon: string | undefined, onClick: MouseEventHandler) => {
        menu.push(
            <MenuItem
                key={name}
                label={camelCaseToWords(name)}
                icon={getIcon(icon)}
                onClick={onClick}
            />
        );
    };

    // Constants
    const constantMenuItems: ReactNode[] = [];
    for (const def of constantDefinitions.values()) {
        addNodeToMenu(
            constantMenuItems,
            def.varType,
            def.icon,
            () => onCreateNode((x, y) => createConstantNode(def.varType, x, y))
        );
    }
    const constantsMenu = (
        <MenuSub icon={<IconPlus/>} label="Add Constant">
            {constantMenuItems}
        </MenuSub>
    );
    for (const def of controlFlowDefinitions.values()) {
        addToNodeMenu(def);
    }
    for (const def of operationDefinitions.values()) {
        addToNodeMenu(def);

    // Core functions
    const categorizedMenuItems = new Map<string, ReactNode[]>();
    const addNodeToCategoryMenu = (name: string, category: string, icon: string | undefined, onClick: MouseEventHandler) => {
        let menu = categorizedMenuItems.get(category);
        if (menu === undefined) {
            menu = categorizedMenuItems.set(category, []).get(category);
        }
        addNodeToMenu(menu!, name, icon, onClick);
    };

    for (const def of coreFunctionDefinitions.values()) {
        addNodeToCategoryMenu(
            def.name,
            def.category || "default",
            def.icon,
            () => onCreateNode((x, y) => createCoreFunctionCallNode(def.name, x, y))
        );
    }

    const categorizedSubMenus: ReactNode[] = [];
    for (const [category, nodes] of categorizedMenuItems) {
        const def = coreCategories.get(category) || { name: "default", icon: "default" };
        categorizedSubMenus.push(
            <MenuSub
                key={category}
                label={camelCaseToWords(category)}
                icon={getIcon(def.icon)}
            >
                {nodes}
            </MenuSub>
        );
    }

    const coreFunctionsMenu = (
        <MenuSub label="Add Core Function" icon={<IconPlus />}>
            {categorizedSubMenus}
        </MenuSub>
    );

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
                    {constantsMenu}
                    {coreFunctionsMenu}
                </Menu>
            </div>
        </GraphContext.Provider>
    );
}