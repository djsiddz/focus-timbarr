import { useState, useMemo } from 'react';
import { useTimer } from '../hooks/useTimer';
import { useSettings, ColorTheme } from '../hooks/useSettings';
import SettingsModal from './SettingsModal';
import {
    PlayIcon,
    PlusSignIcon,
    Settings01Icon,
    Cancel01Icon,
    PauseIcon,
    StopIcon,
    ArrowTurnBackwardIcon,
    MinusSignIcon,
    MaximizeScreenIcon
} from 'hugeicons-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
};

const gradientMap: Record<ColorTheme, string> = {
    red: "from-red-600 to-red-950",
    orange: "from-orange-500 to-orange-900",
    green: "from-green-500 to-green-900",
    blue: "from-blue-500 to-blue-900",
    pink: "from-pink-500 to-pink-900",
    white: "from-gray-300 to-gray-700",
};

const solidColorMap: Record<ColorTheme, string> = {
    red: "bg-red-600",
    orange: "bg-orange-500",
    green: "bg-green-500",
    blue: "bg-blue-500",
    pink: "bg-pink-500",
    white: "bg-gray-300",
};

import { exit } from '@tauri-apps/plugin-process';

export default function TimerBar() {
    const { settings } = useSettings();
    const { state, duration, remainingTime, start, pause, resume, stop, restart } = useTimer(settings.timerPresets[0] * 60 || 900);
    const [showTimeOptions, setShowTimeOptions] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const appWindow = getCurrentWindow();

    // Segment logic
    const segments = useMemo(() => {
        if (duration <= 15 * 60) return 5;
        if (duration <= 30 * 60) return 5;
        return 10;
    }, [duration]);

    const segmentCount = duration / (segments * 60);

    const handleCustomStart = (mins: number) => {
        start(mins * 60);
        setShowTimeOptions(false);
    };

    const handleClose = async () => {
        try {
            await exit(0);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div
            onPointerDown={() => appWindow.startDragging()}
            className="w-full h-[40px] bg-[#0A0A0A] flex items-center justify-between overflow-hidden select-none text-xs text-white relative"
        >
            {/* Background Progress Bar */}
            <div
                className="absolute inset-0 pointer-events-none z-0 h-[40px] transition-opacity duration-300"
                style={{ opacity: state === 'idle' ? 0 : 1 }}
            >
                {Array.from({ length: Math.ceil(segmentCount) }).map((_, i) => {
                    const isIdle = state === 'idle' || state === 'stopped';
                    const S_sec = segments * 60;

                    let fill = 0;
                    let isActive = false;

                    const segmentStart = i * S_sec;
                    const segmentEnd = Math.min((i + 1) * S_sec, duration);
                    const actualSegmentDuration = segmentEnd - segmentStart;

                    if (isIdle) {
                        fill = 100;
                        if (i === Math.ceil(segmentCount) - 1) {
                            isActive = true;
                        }
                    } else if (remainingTime >= segmentEnd) {
                        fill = 100;
                    } else if (remainingTime <= segmentStart) {
                        fill = 0;
                    } else {
                        fill = ((remainingTime - segmentStart) / actualSegmentDuration) * 100;
                        isActive = true;
                    }

                    const containerWidthPct = (actualSegmentDuration / duration) * 100;
                    const containerLeftPct = (segmentStart / duration) * 100;

                    return (
                        <div
                            key={i}
                            className="absolute top-0 bottom-0 border-r-2 border-[#0A0A0A] last:border-none"
                            style={{
                                left: `${containerLeftPct}%`,
                                width: `${containerWidthPct}%`
                            }}
                        >
                            <div
                                className={`h-full origin-left ${isActive ? `bg-gradient-to-r ${gradientMap[settings.colorTheme]}` : solidColorMap[settings.colorTheme]}`}
                                style={{
                                    width: `${fill}%`,
                                    transition: state === 'running' ? 'width 1s linear' : 'none',
                                }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Overlay Settings Modal if active */}
            {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

            {/* Left side (drag region proxy & focus message display) */}
            <div className={`flex-1 h-full z-10 flex items-center pl-4 font-bold pointer-events-none ${settings.colorTheme === 'white' ? 'text-black' : 'text-[#E5E5E5]'}`}>
                {settings.focusMessage && (
                    <span className="truncate pr-4 flex items-center space-x-2">
                        {settings.focusEmoji && <span className="bg-black rounded-full px-1.5 py-1 text-white">{settings.focusEmoji}</span>}
                        <span>{settings.focusMessage}</span>
                    </span>
                )}
            </div>

            {/* Right side controls */}
            <div
                className={`flex items-center h-full pr-4 z-10 transition-opacity ${showSettings ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                onPointerDown={(e) => e.stopPropagation()} // Prevent dragging when clicking controls
            >
                {/* State Controls Container */}
                <div className={`flex items-center space-x-4 ${settings.colorTheme === 'white' ? 'mix-blend-difference text-white' : 'text-[#E5E5E5]'}`}>
                    {showTimeOptions ? (
                        <div className="flex items-center space-x-3 text-[#A3A3A3] font-bold">
                            {settings.timerPresets.map(m => (
                                <button
                                    key={m}
                                    className="hover:text-white transition-colors cursor-pointer"
                                    onClick={() => handleCustomStart(m)}
                                >
                                    {m}m
                                </button>
                            ))}
                            <button
                                className={`hover:text-${settings.colorTheme}-500 transition-colors cursor-pointer ml-2`}
                                onClick={() => setShowTimeOptions(false)}
                            >
                                <Cancel01Icon size={18} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="font-bold tracking-widest text-[#E5E5E5] mr-2">
                                {state === 'idle' ? `--:-- / ${formatTime(duration)}` : `${formatTime(remainingTime)} / ${formatTime(duration)}`}
                            </div>

                            <div className="flex items-center space-x-3 text-[#A3A3A3]">
                                {state === 'idle' && (
                                    <>
                                        <button className="hover:text-white transition-colors cursor-pointer" onClick={() => start()}><PlayIcon size={18} /></button>
                                        <button className="hover:text-white transition-colors cursor-pointer" onClick={() => setShowTimeOptions(true)}><PlusSignIcon size={18} /></button>
                                        <button className="hover:text-white transition-colors cursor-pointer" onClick={() => setShowSettings(true)}><Settings01Icon size={18} /></button>
                                    </>
                                )}

                                {state === 'running' && (
                                    <>
                                        <button className="hover:text-white transition-colors cursor-pointer" onClick={pause}><PauseIcon size={18} /></button>
                                        <button className="hover:text-white transition-colors cursor-pointer" onClick={stop}><StopIcon size={18} /></button>
                                        <button className="hover:text-white transition-colors cursor-pointer" onClick={restart}><ArrowTurnBackwardIcon size={18} /></button>
                                    </>
                                )}

                                {state === 'paused' && (
                                    <>
                                        <button className="hover:text-white transition-colors cursor-pointer" onClick={resume}><PlayIcon size={18} /></button>
                                        <button className="hover:text-white transition-colors cursor-pointer" onClick={stop}><StopIcon size={18} /></button>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Window controls line separator */}
                <div className={`flex items-center space-x-3 border-l border-[#A3A3A3]/30 pl-4 ml-4 z-10 h-10 ${settings.colorTheme === 'white' ? 'mix-blend-difference text-gray-400' : 'text-[#737373]'}`}>
                    <button className="cursor-not-allowed opacity-50"><MinusSignIcon size={16} /></button>
                    <button className="cursor-not-allowed opacity-50"><MaximizeScreenIcon size={14} /></button>
                    <button className="hover:text-red-500 transition-colors cursor-pointer" onClick={handleClose}><Cancel01Icon size={18} /></button>
                </div>
            </div>
        </div>
    );
}
