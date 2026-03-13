import { useEffect } from "react";
import TimerBar from "./components/TimerBar";
import { getCurrentWindow, LogicalSize, LogicalPosition, currentMonitor } from "@tauri-apps/api/window";

function App() {
  useEffect(() => {
    const setupWindow = async () => {
      try {
        const appWindow = getCurrentWindow();

        let monitor;
        try {
          monitor = await currentMonitor();
        } catch (_) {
          // @ts-expect-error fallback
          monitor = await appWindow.currentMonitor();
        }

        if (monitor) {
          // Set to full width and exactly 40px height
          await appWindow.setSize(new LogicalSize(monitor.size.width, 40));
          // Use LogicalPosition to strictly pin it to the top.
          await appWindow.setPosition(new LogicalPosition(0, 0));
        }
      } catch (err) {
        console.error("Failed to setup window", err);
      }
    };

    // Delay slightly so the Tauri window bounds constraints don't block
    const timer = setTimeout(() => {
      setupWindow();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="w-full h-[40px] bg-transparent overflow-hidden">
      <TimerBar />
    </main>
  );
}

export default App;
