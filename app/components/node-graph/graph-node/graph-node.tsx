import { useRef } from "react";
import classes from "./graph-node.module.css";

export function GraphNode() {
    const ref = useRef<HTMLDivElement>(null);
    const position = useRef({x: 0, y: 0});
    const dragOrigin = useRef({positionX: 0, positionY: 0, pointerX: 0, pointerY: 0});
    
    function onPointerDown(event: React.PointerEvent) {
        if(dragOrigin.current === null || event.button !== 0) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
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

        if(ref.current === null || position.current === null || dragOrigin.current === null) {
            return;
        }

        const roundToGrid: (x: number) => number = x => Math.round(x / 32) * 32;
        
        const offset = {
            x: event.clientX - dragOrigin.current.pointerX,
            y: event.clientY - dragOrigin.current.pointerY,
        }
        
        position.current.x = roundToGrid(dragOrigin.current.positionX + offset.x);
        position.current.y = roundToGrid(dragOrigin.current.positionY + offset.y);

        ref.current.style.translate = `${position.current.x}px ${position.current.y}px`;
    }

    function onPointerUp() {
        document.documentElement.classList.remove("move-cursor");
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
    }


    return (
        <div
            ref={ref}
            className={classes.node}
            onPointerDown={onPointerDown}
        >
            <div className={classes.head}>
                <span>Node Name</span>
            </div>
            <div className={classes.body}>
                <p>Contents of node</p>
            </div>
        </div>
    );
}