import classes from "./graph-link.module.css";
import { GraphLink, GraphLinkProps } from "./graph-link";

export type GraphLinkIndicatorProps = {
    visible?: boolean
    link: GraphLinkProps
}

export function GraphLinkIndicator({ visible, link }: GraphLinkIndicatorProps) {
    return (
        <div className={classes.indicator} data-visible={visible}>
            <GraphLink {...link} />
        </div>
    )
}