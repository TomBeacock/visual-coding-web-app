import classes from "./number-input.module.css";
import { ComponentPropsWithoutRef, useRef, useState } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import * as math from "mathjs";

type NumberInputProps = ComponentPropsWithoutRef<"input"> & {
    selectOnFocus?: boolean
}

export default function NumberInput({ selectOnFocus, defaultValue, ...props }: NumberInputProps) {
    const ref = useRef<HTMLInputElement>(null);

    const initialValue = typeof defaultValue === "number" || typeof defaultValue === "string" ? defaultValue : 0;
    const [value, setValue] = useState(initialValue);

    function onChange(event: React.ChangeEvent<HTMLInputElement>) {
        setValue(event.target.value);
    }

    function onBlur(event: React.ChangeEvent<HTMLInputElement>) {
        const value = math.evaluate(event.target.value);
        if(typeof value !== "number") {
            return;
        }
        setValue(value);
    }

    function onLeftButtonClick() {
        setValue(+value - 1);
    }

    function onRightButtonClick() {
        setValue(+value + 1);
    }

    function onKeyDown(event: React.KeyboardEvent) {
        if(ref.current !== null && event.key === "Enter") {
            ref.current?.blur();
        }
    }

    return (
        <div className={classes.root}>
            <input
                ref={ref}
                className={classes.input}
                type="text"
                value={value}
                onChange={onChange}
                onFocus={() => { if (selectOnFocus) ref.current?.select() }}
                onDragStart={(event) => event.preventDefault()}
                onBlur={onBlur}
                onKeyDown={onKeyDown}
                {...props}
            />
            <button
                className={`${classes.button} ${classes.left}`}
                onClick={onLeftButtonClick}
                onPointerDown={(event) => event.preventDefault()}
            >
                <IconChevronLeft/>
            </button>
            <button
                className={`${classes.button} ${classes.right}`}
                onClick={onRightButtonClick}
                onPointerDown={(event) => event.preventDefault()}
            >
                <IconChevronRight/>
            </button>
        </div>
    );
}