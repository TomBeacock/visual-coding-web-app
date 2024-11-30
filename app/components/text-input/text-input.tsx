import classes from "./text-input.module.css";
import { ComponentPropsWithoutRef, useRef, useState } from "react";

type TextInputProps = ComponentPropsWithoutRef<"input"> & {
    selectOnFocus?: boolean
}

export default function TextInput({ selectOnFocus, defaultValue, className, ...props }: TextInputProps) {
    const ref = useRef<HTMLInputElement>(null);

    const [value, setValue] = useState(defaultValue);

    function onKeyDown(event: React.KeyboardEvent) {
        if(ref.current !== null && event.key === "Enter") {
            ref.current.blur();
        }
    }

    return (
        <input
            ref={ref}
            className={`${classes.input} ${className}`}
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onFocus={() => { if (selectOnFocus) ref.current?.select() }}
            onDragStart={(event) => event.preventDefault()}
            onKeyDown={onKeyDown}
            {...props}
        />
    );
}