"use client"

import classes from "./menu.module.css";
import { PropsWithChildren, ReactNode, useState } from "react";
import Portal from "../portal";
import { IconChevronRight } from "@tabler/icons-react";

type MenuProps = PropsWithChildren<{
    x: number,
    y: number,
    position: "top" | "right" | "bottom" | "left";
    visible?: boolean,
}>

export function Menu({ x, y, visible, children }: MenuProps) {
    return (
        <Portal>
            <div
                className={classes.menu}
                data-visible={visible}
                style={{ left: x, top: y }}
            >
                {children}
            </div>
        </Portal>
    )
}

type MenuTargetProps = PropsWithChildren

export function MenuTarget({ children }: MenuTargetProps) {
    return <>{children}</>;
}

type MenuItemProps = {
    icon?: ReactNode,
    label?: string,
}

export function MenuItem({ icon, label }: MenuItemProps) {
    return (
        <button className={classes.item}>
            <>{icon}</>
            <span>{label}</span>
        </button>
    );
}

type MenuSubProps = PropsWithChildren<MenuItemProps>

export function MenuSub({ icon, label, children }: MenuSubProps) {
    const [isOpen, setIsOpen] = useState(false);

    function onPointerEnter() {
        setIsOpen(true);
    }

    function onPointerLeave() {
        setIsOpen(false);
    }

    return (
        <div
            className={classes.sub}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
        >
            <button
                className={classes.item}
            >
                <>{icon}</>
                <span>{label}</span>
                <IconChevronRight />
            </button>
            <div
                className={classes.menu}
                data-visible={isOpen}
            >
                {children}
            </div>
        </div>
    );
}

export function MenuDivider() {
    return (
        <div className={classes.divider}>

        </div>
    );
}