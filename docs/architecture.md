## Architecture Overview

This document outlines the high-level architecture of the application.

### Platform Constraint

- macOS, Windows and Linux

### Module Format & Runtime Constraints

- Source and runtime: **ESM-only**
- Exception: **preload bundle** may emit **CommonJS** (required for `sandbox: true`)
- CommonJS is **forbidden** elsewhere at runtime

### Directory Layout Architecture

This section defines how the codebase is structured and the responsibilities of each layer. The goal is to keep concerns well separated, enforce safe communication between processes, and ensure the code remains maintainable and scalable as the project grows.

```txt
src/
  shared/ - platform-agnostic cross-layer code reused by main, preload, and renderer
  main/ - - Electron main process
  preload/ - secure bridge between main and renderer (contextIsolation + contextBridge)
  renderer/ - UI layer (React + Tailwind + ShadCN, runs in browser context)
package.json
electron.vite.config.ts - Vite + Electron build configuration
tsconfig.json - base TypeScript configuration
tsconfig.node.json - Node/Electron main process TypeScript configuration
tsconfig.web.json - renderer/web TypeScript configuration
eslint.config.mjs - ESLint configuration
prettier.config.mjs - Prettier configuration
electron-builder.yml - Electron build and packaging configuration
```

### Naming Conventions

- folders/files: kebab-case
