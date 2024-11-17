import { MouseEventHandler, PropsWithChildren } from "react";
import classes from "./button.module.css";

type ButtonProps = PropsWithChildren<{
    disabled?: boolean,
    onClick?: MouseEventHandler<HTMLButtonElement>,
}>

export default function Button({
    children
}: ButtonProps) {
    return (
        <div
            className={classes.group}
        >
            {children}
        </div>
    );
}