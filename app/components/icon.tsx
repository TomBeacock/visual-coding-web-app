import "@material-symbols/font-400/rounded.css"

type IconProps = {
    name: string
}

export default function Icon({ name }: IconProps) {
    return <span className="material-symbols-rounded">{name}</span>;
}
