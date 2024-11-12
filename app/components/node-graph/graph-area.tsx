import { GraphNode } from "./graph-node/graph-node";
import classes from "./graph-area.module.css"
import { useRef } from "react";

export function GraphArea() {
    const viewportRef = useRef<HTMLDivElement>(null);
    const areaRef = useRef<HTMLDivElement>(null);
    const position = useRef({x: 0, y: 0});
    const dragOrigin = useRef({positionX: 0, positionY: 0, pointerX: 0, pointerY: 0});
    
    function onPointerDown(event: React.PointerEvent) {
        if(dragOrigin.current === null || event.button !== 1) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        console.log("pointer down");
        document.documentElement.classList.add("move-cursor");
        
        dragOrigin.current = {
            positionX: position.current.x,
            positionY: position.current.y,
            pointerX: event.clientX,
            pointerY: event.clientY,
        };
        
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
    }
    
    function onPointerMove(event: PointerEvent) {
        if(
            viewportRef.current === null || areaRef.current === null ||
            position.current === null || dragOrigin.current === null) {
            return;
        }
        
        const offset = {
            x: event.clientX - dragOrigin.current.pointerX,
            y: event.clientY - dragOrigin.current.pointerY,
        }
        
        position.current.x = dragOrigin.current.positionX + offset.x;
        position.current.y = dragOrigin.current.positionY + offset.y;

        const mod: (x: number) => number = x => x % 32 + 16;

        viewportRef.current.style.backgroundPosition = `${mod(position.current.x)}px ${mod(position.current.y)}px`;
        areaRef.current.style.translate = `${position.current.x}px ${position.current.y}px`;
    }

    function onPointerUp() {
        document.documentElement.classList.remove("move-cursor");
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
    }

    return (
        <div
            ref={viewportRef}
            className={classes.viewport}
            onPointerDown={onPointerDown}
        >
            <div
                ref={areaRef}    
                className={classes.area}
            >
                <GraphNode/>
            </div>
        </div>
    );
}