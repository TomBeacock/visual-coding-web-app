import classes from "./checkbox.module.css";
import { ComponentPropsWithoutRef, useState } from "react";
import { IconCheck } from "@tabler/icons-react";

export default function Checkbox({ checked, ...props }: ComponentPropsWithoutRef<"input">) {
    const [isChecked, setIsChecked] = useState(checked || false);

    return (
        <div
            className={classes.checkbox}
        >
            <input
                type="checkbox"
                onChange={() => setIsChecked(!isChecked)}
                {...props}
            />
            <IconCheck />
        </div>
    );
}