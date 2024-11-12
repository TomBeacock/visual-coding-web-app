import { ComponentPropsWithoutRef, ReactNode } from "react";
import classes from "./button.module.css";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
    leftContent?: ReactNode,
    rightContent?: ReactNode,
    iconOnly?: boolean,
}

export default function Button({
    leftContent,
    rightContent,
    iconOnly,
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            className={classes.button}
            data-icon-only={iconOnly}
            {...props}
        >
            {leftContent}
            {children}
            {rightContent}
        </button>
    );
}