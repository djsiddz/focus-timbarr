import { useState } from 'react';
import { useSettings, ColorTheme } from '../hooks/useSettings';
import { Cancel01Icon, PlusSignIcon, Tick01Icon } from 'hugeicons-react';

interface SettingsModalProps {
    onClose: () => void;
}

const colorMap: Record<ColorTheme, string> = {
    red: "bg-red-600",
    orange: "bg-orange-500",
    green: "bg-green-500",
    blue: "bg-blue-500",
    pink: "bg-pink-500",
    white: "bg-white",
};

export default function SettingsModal({ onClose }: SettingsModalProps) {
    const { settings, setSettings } = useSettings();
    const [msg, setMsg] = useState(settings.focusMessage);
    const [emoji, setEmoji] = useState(settings.focusEmoji);
    const [isAddingPreset, setIsAddingPreset] = useState(false);
    const [newPresetValue, setNewPresetValue] = useState(15);

    const handleSave = () => {
        // Emojis can be complex multi-byte zero-width joiners up to ~10 chars long, don't slice strictly to 2.
        setSettings({ focusMessage: msg.trim().slice(0, 100), focusEmoji: emoji.trim() });
        onClose();
    };

    const handleRemovePreset = (val: number) => {
        setSettings({ timerPresets: settings.timerPresets.filter(p => p !== val) });
    };

    const confirmAddPreset = () => {
        const val = Math.max(1, Math.min(120, newPresetValue));
        if (!settings.timerPresets.includes(val)) {
            setSettings({ timerPresets: [...settings.timerPresets, val].sort((a, b) => a - b) });
        }
        setIsAddingPreset(false);
    };

    return (
        <div
            className="flex-1 flex items-center justify-between px-4 h-full bg-[#1A1A1A] z-20 absolute inset-0"
            onPointerDown={(e) => e.stopPropagation()}
        >
            {/* Left: Input text & emoji */}
            <div className="flex items-center space-x-3 w-1/3">
                <input
                    className="bg-[#2A2A2A] text-white px-2 py-1 rounded w-10 text-center outline-none focus:ring-1 focus:ring-white border-none"
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    maxLength={10}
                    placeholder="🔥"
                />
                <input
                    className="bg-[#2A2A2A] text-white px-3 py-1 flex-1 rounded text-xs outline-none focus:ring-1 focus:ring-white border-none"
                    value={msg}
                    onChange={(e) => setMsg(e.target.value.slice(0, 100))}
                    placeholder="Focus task..."
                />
            </div>

            {/* Middle: Timer Presets */}
            <div className="flex items-center space-x-2">
                {settings.timerPresets.map(val => (
                    <div key={val} className="group relative flex items-center bg-[#2A2A2A] text-[#E5E5E5] px-2 py-1 rounded-full text-[10px] font-bold">
                        {val}m
                        <button
                            className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemovePreset(val)}
                        >
                            <Cancel01Icon size={10} />
                        </button>
                    </div>
                ))}
                {settings.timerPresets.length < 6 && (
                    isAddingPreset ? (
                        <div className="flex items-center space-x-1">
                            <input
                                autoFocus
                                type="number"
                                className="bg-[#2A2A2A] text-white px-2 py-0.5 rounded w-12 text-[10px] outline-none focus:ring-1 focus:ring-white border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                value={newPresetValue}
                                onChange={(e) => setNewPresetValue(parseInt(e.target.value) || 0)}
                                min={1}
                                max={120}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') confirmAddPreset();
                                    if (e.key === 'Escape') setIsAddingPreset(false);
                                }}
                            />
                            <button className="text-green-500 hover:text-green-400 cursor-pointer" onClick={confirmAddPreset}>
                                <Tick01Icon size={12} />
                            </button>
                            <button className="text-red-500 hover:text-red-400 cursor-pointer" onClick={() => setIsAddingPreset(false)}>
                                <Cancel01Icon size={12} />
                            </button>
                        </div>
                    ) : (
                        <button
                            className="text-[#A3A3A3] hover:text-white transition-colors cursor-pointer"
                            onClick={() => setIsAddingPreset(true)}
                        >
                            <PlusSignIcon size={14} />
                        </button>
                    )
                )}
            </div>

            {/* Right: Colors and Actions */}
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 mr-4 border-r border-[#333] pr-4">
                    {(Object.keys(colorMap) as ColorTheme[]).map(c => (
                        <button
                            key={c}
                            className={`w-4 h-4 rounded-full ${colorMap[c]} ring-offset-[#1A1A1A] ${settings.colorTheme === c ? 'ring-2 ring-white ring-offset-2' : ''}`}
                            onClick={() => setSettings({ colorTheme: c })}
                        />
                    ))}
                </div>

                <button
                    className="text-green-400 hover:text-green-300 transition-colors flex items-center space-x-1"
                    onClick={handleSave}
                >
                    <Tick01Icon size={16} /> <span className="font-bold">Save</span>
                </button>
            </div>
        </div>
    );
}
