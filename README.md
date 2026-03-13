# Focus Timbarr

## Known Issues

- The app is not resizable - it's a feature.
- The app is not closable - it's a bug.
- The app is not draggable - it's a bug.

- Building for Windows from WSL is a painful process.
  - Option 1 ran into issues with pnpm install itself.
  - Option 2 is heavy so not attempting with the current system state.
- Developing for Windows from WSL is a annoying due to Wayland/X11 WSLg whatever issues there are.

## Building for Windows from WSL

### Option 1: The Fast Way (Native Windows Host)

Since WSL seamlessly shares its filesystem with Windows, you can just build it natively using your Windows host machine. This is by far the most reliable method because it uses the native Windows WebView2 and MSVC toolchains without fighting Linux cross-compilation.

Open PowerShell or Command Prompt on your normal Windows desktop.
Navigate to your WSL directory (replace Ubuntu if your distro is named differently):
powershell
cd \\wsl$\Ubuntu\home\sili\sid\focus-timbarr
Run the following commands to install and build securely for Windows native:
powershell
pnpm install
pnpm tauri build
(Note: This requires you to have Node and Rust installed on your Windows side as well).

### Option 2: The Hard Way (Cross-Compiling from inside WSL)

If you do not have Rust/Node installed on Windows, we can cross-compile it directly from this WSL Linux terminal. However, be warned that compiling Windows binaries from Linux requires setting up a few extra heavy toolchains (mingw-w64 C++ compilers, nsis installer packager, and the Rust GNU target).
