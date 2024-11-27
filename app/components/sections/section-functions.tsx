import classes from "./section.module.css";
import Button from "../button/button";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { ReactNode } from "react";
import { useProgram } from "../app-provider/app-provider";
import { NavList, NavListItem } from "../nav-list/nav-list";
import { camelCaseToWords } from "@/app/lib/program/program-util";
import { addFunction, deleteFunction } from "@/app/lib/program/program-algorithm";

export function SectionFunctions() {
    const { program, setProgram, selectedFunction, setSelectedFunction } = useProgram();

    function onAddButtonClick() {
        const newProgram = { ...program };
        const newFunctionName = addFunction(newProgram, "newFunction");
        setProgram(newProgram);
        setSelectedFunction(newFunctionName);
    }

    function onDeleteButtonClick() {
        const newProgram = { ...program };
        deleteFunction(newProgram, selectedFunction);
        setProgram(newProgram);
        setSelectedFunction("main");
    }

    function onItemClick(funcName: string) {
        if (funcName !== selectedFunction) {
            setSelectedFunction(funcName);
        }
    }

    const items: ReactNode[] = [];
    for (const [funcName] of program.functions) {
        items.push(
            <NavListItem
                key={funcName}
                selected={funcName === selectedFunction}
                onClick={() => onItemClick(funcName)}
            >
                {camelCaseToWords(funcName)}
            </NavListItem>
        );
    }

    return (
        <div className={classes.section}>
            <div className={classes["action-bar"]}>
                <Button iconOnly onClick={onAddButtonClick}>
                    <IconPlus />
                </Button>
                <Button iconOnly onClick={onDeleteButtonClick} disabled={selectedFunction === "main"}>
                    <IconTrash />
                </Button>
            </div>
            <NavList>
                {items}
            </NavList>
        </div>
    );
}