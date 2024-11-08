"use client"

import "@material-symbols/font-400/rounded.css"

export function Icon({ name }: { name: string }) {
    return <span className="material-symbols-rounded">{name}</span>;
}
