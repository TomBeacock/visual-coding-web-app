import { GraphArea } from "../node-graph/graph-area";
import { IconPlus } from "@tabler/icons-react";
import classes from "./section.module.css";
import Button from "../button/button";

export function SectionGraph() {
    return (
        <div className={classes.section}>
            <div className={classes["action-bar"]}>
                <Button iconOnly>
                    <IconPlus />
                </Button>
            </div>
            <GraphArea />
        </div>
    );
}