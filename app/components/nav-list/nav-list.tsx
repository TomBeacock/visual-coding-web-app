import classes from "./nav-list.module.css";
import { ComponentPropsWithoutRef } from "react";

type NavListProps = ComponentPropsWithoutRef<"ul">;

export function NavList({ children, ...props }: NavListProps) {
    return (
        <ul className={classes.list} {...props}>{children}</ul>
    );
}

type NavListItemProps = ComponentPropsWithoutRef<"li"> & {
    selected?: boolean,
}

export function NavListItem({ selected, children, ...props }: NavListItemProps) {
    return (
        <li className={classes.item} data-selected={selected} {...props}>{children}</li>
    );
}