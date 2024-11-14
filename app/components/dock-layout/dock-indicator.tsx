import classes from "./dock-layout.module.css";

export type DockIndicatorProps = {
    visible: boolean,
    rect: {
        x: number,
        y: number,
        width: number,
        height: number,
    }
}

export function DockIndicator({ visible, rect }: DockIndicatorProps) {
    return (
        <div
            className={classes.indicator}
            data-visible={visible}
            style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}
        />
    );
}