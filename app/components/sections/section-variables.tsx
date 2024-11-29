import classes from "./section.module.css";
import Button from "../button/button";
import { IconCodeVariablePlus, IconCrop169Filled } from "@tabler/icons-react";
import { ReactNode } from "react";
import { useProgram } from "../app-provider/app-provider";
import { NavList, NavListItem } from "../nav-list/nav-list";
import { camelCaseToWords, getVariableTypeColor } from "@/app/lib/program/program-util";
import { addVariable } from "@/app/lib/program/program-algorithm";

export function SectionVariables() {
    const { program, setProgram, selectedFunction } = useProgram();

    function onAddButtonClick() {
        const newProgram = { ...program };
        addVariable(newProgram, selectedFunction, "newVariable");
        setProgram(newProgram);
    }

    const items: ReactNode[] = [];
    const func = program.functions.get(selectedFunction);
    if (func !== undefined) {
        for (const def of func.variables.values()) {
            items.push(
                <NavListItem
                    key={def.name}
                >
                    <IconCrop169Filled color={getVariableTypeColor(def.varType)}/>
                    {camelCaseToWords(def.name)}
                </NavListItem>
            );
        }
    }

    return (
        <div className={classes.section}>
            <div className={classes["action-bar"]}>
                <Button iconOnly onClick={onAddButtonClick}>
                    <IconCodeVariablePlus />
                </Button>
            </div>
            <NavList>
                {items}
            </NavList>
        </div>
    );
}