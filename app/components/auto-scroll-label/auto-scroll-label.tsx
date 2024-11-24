import { PropsWithChildren } from "react";
import classes from "./auto-scroll-label.module.css";

export function AutoScrollLabel({ children } : PropsWithChildren) {
    return (
        <div className={classes.label}>
            <span>{children}</span>
        </div>
    );
}