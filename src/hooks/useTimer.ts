import { useState, useRef, useCallback, useEffect } from 'react';

export type TimerState = 'idle' | 'running' | 'paused' | 'stopped';

export function useTimer(initialDurationSeconds: number = 3600) {
    const [state, setState] = useState<TimerState>('idle');
    const [duration, setDuration] = useState(initialDurationSeconds);
    const [remainingTime, setRemainingTime] = useState(initialDurationSeconds);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (state === 'running') {
            timerRef.current = window.setInterval(() => {
                setRemainingTime((prev) => {
                    if (prev <= 1) {
                        setState('idle');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) window.clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) window.clearInterval(timerRef.current);
        };
    }, [state]);

    const start = useCallback((newDurationSeconds?: number) => {
        const dur = newDurationSeconds ?? duration;
        setDuration(dur);
        setRemainingTime(dur);
        setState('running');
    }, [duration]);

    const pause = useCallback(() => {
        setState('paused');
    }, []);

    const resume = useCallback(() => {
        setState('running');
    }, []);

    const stop = useCallback(() => {
        setState('idle');
        setRemainingTime(duration);
    }, [duration]);

    const restart = useCallback(() => {
        start(duration);
    }, [duration, start]);

    return { state, duration, remainingTime, start, pause, resume, stop, restart };
}
