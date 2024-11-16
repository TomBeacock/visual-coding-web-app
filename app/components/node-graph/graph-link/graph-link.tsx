import classes from "./graph-link.module.css";

export type GraphLinkProps = {
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
}

function calculatePath(
    x1: number, y1: number,
    x2: number, y2: number,
    curveRadius: number,
    minOffset: number,
    padding: number
): {
    x: number, y: number,
    width: number, height: number,
    path: string
} {
    const dx = minOffset;
    const p = padding;

    // Bounds
    const minX = Math.min(x1, x2 - dx) - p;
    const maxX = Math.max(x1 + dx, x2) + p;
    const minY = Math.min(y1, y2) - p;
    const maxY = Math.max(y1, y2) + p;
    const width = maxX - minX
    const height = maxY - minY;

    let path: string = "";
    // Horizontal path
    if (y1 === y2) {
        if (x1 === x2) {
            path = "";
        }
        else if (x2 > x1) {
            path = `h ${x2 - x1}`;
        }
        else {
            path = `h ${dx} h ${x2 - 2 * dx - x1} h ${dx}`
        }
    }
    // Single joint path
    else if (x1 + dx <= x2 - dx) {
        const cr = Math.min(curveRadius, Math.abs(y2 - y1) / 2); // Curve radius
        const sign = y2 > y1 ? 1 : -1;
        const scr = cr * sign; // Signed curve radius
        const w = (x2 - x1) / 2 - cr; // Horizontal segments width
        const h = (Math.abs(y2 - y1) - 2 * cr) * sign; // Vertical segment height
        path = `h ${w} q ${cr} 0, ${cr} ${scr} v ${h} q 0 ${scr}, ${cr} ${scr} h ${w}`;
    }
    // Double joint path (S-bend)
    else {
        const cr = Math.min(curveRadius, Math.abs(y2 - y1) / 4); // Curve radius
        const icr = Math.min(curveRadius, cr, ((x1 + dx) - (x2 - dx)) / 2); // Inner curve radius
        const sign = y2 > y1 ? 1 : -1;
        const scr = cr * sign; // Signed curve radius
        const sicr = icr * sign; // Signed inner curve radius
        const w = x1 - x2 + 2 * dx - 2 * icr; // Horizontal segment width
        const h = (Math.abs(y2 - y1) - 2 * cr - 2 * icr) / 2 * sign; // Vertical segments height
        path = `h ${dx - cr} q ${cr} 0, ${cr} ${scr} v ${h} q 0 ${sicr}, ${-icr} ${sicr} h ${-w} q ${-icr} 0, ${-icr} ${sicr} v ${h} q 0 ${scr}, ${cr} ${scr} h ${dx - cr}`;
    }

    path = `M ${x1 - minX} ${y1 - minY} ${path}`;

    return {
        x: minX, y: minY,
        width: width, height: height,
        path: path
    };
}

export function GraphLink({ x1, y1, x2, y2, color }: GraphLinkProps) {
    const pathData = calculatePath(x1, y1, x2, y2, 8, 32, 4);

    return (
        <svg
            className={classes.link}
            xmlns="http://www.w3.org/2000/svg"
            width={pathData.width}
            height={pathData.height}
            fill="none"
            strokeWidth={2}
            stroke={color}
            style={{ left: pathData.x, top: pathData.y }}
        >
            <path d={pathData.path} />
        </svg>
    );
}