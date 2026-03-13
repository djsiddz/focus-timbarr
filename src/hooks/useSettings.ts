import { useSyncExternalStore } from "react";

export type ColorTheme = "red" | "orange" | "green" | "blue" | "pink" | "white";

export interface Settings {
    colorTheme: ColorTheme;
    timerPresets: number[];
    focusMessage: string;
    focusEmoji: string;
}

const DEFAULT_SETTINGS: Settings = {
    colorTheme: "red",
    timerPresets: [5, 10, 15, 30, 45, 60],
    focusMessage: "Focus Time",
    focusEmoji: "🔥",
};

let currentSettings: Settings = (() => {
    try {
        const item = window.localStorage.getItem("focus_timbarr_settings");
        return item ? { ...DEFAULT_SETTINGS, ...JSON.parse(item) } : DEFAULT_SETTINGS;
    } catch {
        return DEFAULT_SETTINGS;
    }
})();

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function getSnapshot() {
    return currentSettings;
}

if (typeof window !== 'undefined') {
    window.addEventListener("storage", () => {
        try {
            const item = window.localStorage.getItem("focus_timbarr_settings");
            if (item) {
                currentSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(item) };
                listeners.forEach(l => l());
            }
        } catch { }
    });
}

export function useSettings() {
    const settings = useSyncExternalStore(subscribe, getSnapshot);

    const setSettings = (newSettings: Partial<Settings>) => {
        currentSettings = { ...currentSettings, ...newSettings };
        window.localStorage.setItem("focus_timbarr_settings", JSON.stringify(currentSettings));
        listeners.forEach(l => l());
    };

    return { settings, setSettings };
}
