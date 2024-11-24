import classes from "./graph-node.module.css";
import { useRef } from "react";
import { IconCircle, IconPlayerPlay } from "@tabler/icons-react";
import { Vector2 } from "@/app/lib/vector2";
import { VariableType, TypedPin } from "@/app/lib/program/program-data";
import { addLink, pinEqual, removePinLinks } from "@/app/lib/program/program-algorithm";
import { useProgram } from "../../app-provider/app-provider";
import { useGraph } from "../graph-area";
import { GraphLinkIndicatorProps } from "../graph-link/graph-link-indicator";
import { getVariableTypeColor } from "@/app/lib/program/program-util";

type GraphPinProps = {
    connected?: boolean;
    pin: TypedPin,
    varType: VariableType,
    x: number,
    y: number,
}

export function GraphPin({ connected, pin, varType, x, y }: GraphPinProps) {
    const { program, setProgram, selectedFunction } = useProgram();
    const { linkIndicatorProps, setLinkIndicatorProps, linkDragData, transformScreenPointToGraph } = useGraph();

    const ref = useRef<HTMLDivElement>(null);

    const color = getVariableTypeColor(varType);

    function isValidConnection() {
        if (linkDragData.current === null) {
            return false;
        }
        const dragData = linkDragData.current;
        return varType === dragData.varType &&
            dragData.pin !== undefined &&
            pin.nodeId !== dragData.pin.nodeId &&
            pin.type !== dragData.pin.type;
    }

    function onPointerDown(event: React.PointerEvent) {
        if (linkDragData.current === null ||
            ref.current === null
        ) {
            return;
        }

        // Create new link
        if (event.button === 0) {
            event.preventDefault();

            // Prevent new link under conditions
            if (connected &&
                (varType === "exec" && pin.type === "output" || // Many-to-one
                    varType !== "exec" && pin.type === "input") // One-to-many
            ) {
                return;
            }

            ref.current.classList.add(classes.connecting);

            const dragData = linkDragData.current;
            dragData.origin.x = x;
            dragData.origin.y = y;
            dragData.varType = varType;
            dragData.isDragging = true;
            dragData.pin = pin;

            const newLinkIndicatorProps = {
                visible: true,
                link: {
                    x1: x, y1: y,
                    x2: x, y2: y,
                    color: color,
                }
            } as GraphLinkIndicatorProps;
            setLinkIndicatorProps(newLinkIndicatorProps);

            window.addEventListener("pointermove", onWindowPointerMove);
            window.addEventListener("pointerup", onWindowPointerUp);
        }
        // Delete link
        else if (event.button === 2) {
            event.preventDefault();

            if (!connected) {
                return;
            }

            const newProgram = { ...program };
            removePinLinks(newProgram, selectedFunction, pin);
            setProgram(newProgram);
        }
    }

    function onPointerUp() {
        if (linkDragData.current === null ||
            linkDragData.current.pin === undefined ||
            ref.current === null
        ) {
            return;
        }

        if (!isValidConnection()) {
            ref.current.classList.remove(classes["no-connect"]);
            return;
        }

        ref.current.classList.remove(classes.connecting);

        const newProgram = { ...program };
        if (pin.type === "input") {
            addLink(newProgram, selectedFunction, linkDragData.current.pin, pin);
        }
        else {
            addLink(newProgram, selectedFunction, pin, linkDragData.current.pin);
        }
        setProgram(newProgram);
    }

    function onPointerEnter() {
        if (linkDragData.current === null ||
            !linkDragData.current.isDragging ||
            ref.current === null
        ) {
            return;
        }

        if (!isValidConnection()) {
            ref.current.classList.add(classes["no-connect"]);
            return;
        }

        ref.current.classList.add(classes.connecting);

        const dragData = linkDragData.current;
        dragData.isSnapping = true;

        const newLinkIndicatorProps = {
            visible: true,
            link: {
                x1: pin.type === "output" ? x : dragData.origin.x,
                y1: pin.type === "output" ? y : dragData.origin.y,
                x2: pin.type === "output" ? dragData.origin.x : x,
                y2: pin.type === "output" ? dragData.origin.y : y,
                color: color,
            }
        } as GraphLinkIndicatorProps;
        setLinkIndicatorProps(newLinkIndicatorProps);
    }

    function onPointerLeave() {
        if (linkDragData.current === null ||
            !linkDragData.current.isDragging ||
            ref.current === null
        ) {
            return;
        }

        if (!isValidConnection()) {
            ref.current.classList.remove(classes["no-connect"]);
            return;
        }

        const dragData = linkDragData.current;
        dragData.isSnapping = false;

        if (dragData.pin !== undefined && !pinEqual(pin, dragData.pin)) {
            ref.current.classList.remove(classes.connecting);
        }
    }

    function onWindowPointerMove(event: PointerEvent) {
        if (linkDragData.current === null || linkDragData.current.isSnapping) {
            return;
        }

        const pos = transformScreenPointToGraph(new Vector2(event.clientX, event.clientY));

        const newLinkIndicatorProps = {
            visible: true,
            link: {
                x1: pin.type === "output" ? x : pos.x,
                y1: pin.type === "output" ? y : pos.y,
                x2: pin.type === "output" ? pos.x : x,
                y2: pin.type === "output" ? pos.y : y,
                color: color,
            }
        } as GraphLinkIndicatorProps;
        setLinkIndicatorProps(newLinkIndicatorProps);
    }

    function onWindowPointerUp() {
        window.removeEventListener("pointermove", onWindowPointerMove);
        window.removeEventListener("pointerup", onWindowPointerUp);

        if (linkDragData.current === null ||
            ref.current === null
        ) {
            return
        }

        ref.current.classList.remove(classes.connecting);

        const dragData = linkDragData.current;
        dragData.isDragging = false;
        dragData.isSnapping = false;
        dragData.pin = undefined;

        const newLinkIndicatorProps = {
            ...linkIndicatorProps,
            visible: false,
        } as GraphLinkIndicatorProps;
        setLinkIndicatorProps(newLinkIndicatorProps);
    }

    const iconProps = {
        color: "currentColor",
        size: 16,
    };

    const icon = varType === "exec" ? <IconPlayerPlay {...iconProps} /> : <IconCircle {...iconProps} />;

    return (
        <div
            ref={ref}
            className={classes.pin}
            style={{ color }}
            data-connected={connected}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            onContextMenu={(event) => event.preventDefault()}
        >
            {icon}
        </div>
    );
}