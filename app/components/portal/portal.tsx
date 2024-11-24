import { useRef, useEffect, useState, PropsWithChildren } from "react";
import { createPortal } from "react-dom";

type ClientPortalProps = PropsWithChildren<{
    target?: string,
}>

export default function Portal({ target, children }: ClientPortalProps) {
    const ref = useRef<HTMLElement | null>(null);
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        ref.current = document.querySelector(target || "body");
        setMounted(true);
    }, [target]);

    if (ref.current === null) {
        return <></>;
    }

    return mounted ? createPortal(children, ref.current) : null;
}