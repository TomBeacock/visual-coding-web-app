"use client"

import { createContext, Dispatch, SetStateAction } from "react";
import { DockLayout } from "./components/dock-layout/dock-layout"
import { defaultLayout } from "./default-layout";
import { useState } from "react";
import {
    IconArrowMoveRightFilled,
    IconMoon,
    IconPlayerPauseFilled,
    IconPlayerPlayFilled,
    IconPlayerSkipForwardFilled,
    IconPlayerStopFilled,
    IconRefresh,
    IconStepInto,
    IconStepOut,
    IconSun
} from "@tabler/icons-react";
import Button from "./components/button/button";
import ButtonGroup from "./components/button/button-group";
import { useTheme } from "./components/theme-provider/theme-provider";
import classes from "./visual-coding.module.css";

export type Playback = {
    playing: boolean,
    paused: boolean,
}

export type VisualCodingContextType = {
    playback: Playback,
    setPlayback: Dispatch<SetStateAction<Playback>>
}

export const VisualCodingContext = createContext<VisualCodingContextType>({
    playback: { playing: false, paused: false },
    setPlayback: () => { },
} as VisualCodingContextType);

export default function VisualCoding() {
    const [playback, setPlayback] = useState({ playing: false, paused: false } as Playback);

    const { theme, toggleTheme } = useTheme();

    function onPlayButtonClick() {
        const newPlayback = {
            playing: true,
            paused: false,
        } as Playback;
        setPlayback(newPlayback);
    }

    function onPauseButtonClick() {
        const newPlayback = {
            playing: true,
            paused: true,
        } as Playback;
        setPlayback(newPlayback);
    }

    function onStopButtonClick() {
        const newPlayback = {
            playing: false,
            paused: false,
        } as Playback;
        setPlayback(newPlayback);
    }

    return (
        <VisualCodingContext.Provider
            value={{
                playback: playback,
                setPlayback: setPlayback,
            }}
        >
            <div className={classes.base}>
                <header className={classes.header}>
                    <div>
                        <h1 className={classes.title}>Visual Coding</h1>
                    </div>
                    <ButtonGroup>
                        {
                            !playback.playing ?
                                <Button iconOnly onClick={onPlayButtonClick}>
                                    <IconPlayerPlayFilled />
                                </Button> :
                                <>
                                    {
                                        !playback.paused ?
                                            <Button iconOnly onClick={onPauseButtonClick}>
                                                <IconPlayerPauseFilled />
                                            </Button> :
                                            <Button iconOnly onClick={onPlayButtonClick}>
                                                <IconPlayerSkipForwardFilled />
                                            </Button>
                                    }
                                    <Button iconOnly>
                                        <IconArrowMoveRightFilled />
                                    </Button>
                                    <Button iconOnly>
                                        <IconStepOut />
                                    </Button>
                                    <Button iconOnly>
                                        <IconStepInto />
                                    </Button>
                                    <Button iconOnly>
                                        <IconRefresh />
                                    </Button>
                                    <Button iconOnly onClick={onStopButtonClick}>
                                        <IconPlayerStopFilled />
                                    </Button>
                                </>
                        }
                    </ButtonGroup>
                    <div className={classes["right-settings"]}>
                        <Button iconOnly onClick={() => toggleTheme()}>
                            {theme === "dark" ? <IconSun /> : <IconMoon />}
                        </Button>
                    </div>
                </header>
                <main className={classes.main}>
                    <DockLayout layout={defaultLayout} />
                </main>
            </div>
        </VisualCodingContext.Provider>
    );
}
