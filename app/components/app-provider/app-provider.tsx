import { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useState } from "react";
import { Program, Function as Func } from "@/app/lib/program/program-data";
import { Playback } from "@/app/lib/playback";
import { Vector2 } from "@/app/lib/vector2";

type ProgramContextType = {
    program: Program,
    setProgram: Dispatch<SetStateAction<Program>>,
    selectedFunction: string,
    setSelectedFunction: Dispatch<SetStateAction<string>>,
}

type PlaybackContextType = {
    playback: Playback,
    setPlayback: Dispatch<SetStateAction<Playback>>,
}

const ProgramContext = createContext({} as ProgramContextType);
const PlaybackContext = createContext({} as PlaybackContextType);

export function AppProvider({ children }: PropsWithChildren) {
    const [program, setProgram] = useState({
        functions: new Map<string, Func>([
            ["main", {
                position: Vector2.zero(),
                scale: 1,
                nodes: [],
                links: [],
            }]
        ])
    } as Program);
    const [selectedFunction, setSelectedFunction] = useState("main");
    const [playback, setPlayback] = useState({ playing: false, paused: false } as Playback);

    return (
        <ProgramContext.Provider
            value={{
                program, setProgram,
                selectedFunction, setSelectedFunction,
            }}
        >
            <PlaybackContext.Provider
                value={{
                    playback, setPlayback,
                }}
            >
                {children}
            </PlaybackContext.Provider>
        </ProgramContext.Provider>
    );
}

export const useProgram = () => useContext(ProgramContext);
export const usePlayback = () => useContext(PlaybackContext);