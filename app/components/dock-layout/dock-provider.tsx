import { createContext, Dispatch, MutableRefObject, PropsWithChildren, SetStateAction, useContext } from "react";
import { DockDragData, DockLayoutData } from "./dock-data";
import { DockIndicatorProps } from "./dock-indicator";

type DockLayoutContextType = {
    layout: DockLayoutData,
    setLayout: Dispatch<SetStateAction<DockLayoutData>>,
    indicatorProps: DockIndicatorProps,
    setIndicatorProps: Dispatch<SetStateAction<DockIndicatorProps>>,
    dragData: MutableRefObject<DockDragData>,
}

const DockLayoutContext = createContext<DockLayoutContextType>({
    layout: { root: null },
    setLayout: () => { },
    indicatorProps: { visible: false, rect: { x: 0, y: 0, width: 0, height: 0 } },
    setIndicatorProps: () => { },
    dragData: {
        current: {
            srcNodeId: undefined,
            srcTabIndex: -1,
            dstNodeId: undefined,
            target: "center",
        } as DockDragData
    },
});

export function DockProvider({value, children} : PropsWithChildren<{value: DockLayoutContextType}>) {
    return (
        <DockLayoutContext.Provider value={value}>
            {children}
        </DockLayoutContext.Provider>
    );
}

export const useDock = () => useContext(DockLayoutContext);