# Copilot Instructions for screenlogic-electron

## Build, Test, and Run

```bash
npm start              # Run the Electron app (production)
npm run dev            # Run with dev tools open
npm test               # Run Jest tests (--runInBand: single-threaded)
npm test -- pattern    # Run tests matching pattern
npm run package        # Build app with electron-builder
```

## Architecture

**IPC-based three-layer pattern:**
- **main.js**: Electron main process. Defines IPC handlers mapping `screenlogic:command` to methods in `screenlogic-service.js`. Handler names must match exported function names. Many handlers take a `senderId` parameter (supports multiple concurrent clients).
- **preload.js**: Bridges renderer ↔ main. Uses `contextBridge` to expose `window.screenlogic` API. Mirrors all IPC handlers—add/remove handlers in both main.js and preload.js.
- **src/screenlogic-service.js**: Service layer wrapping `node-screenlogic` library. All pool/spa control logic happens here; main.js just delegates.

**UI:**
- index.html loads React app (renderer.js)
- Development mode opens DevTools automatically

## Key Conventions

**Handler flow:**
IPC handler calls matching service method → method does work via `node-screenlogic` → returns result. Parameters flow through unchanged.

**Multi-client pattern:**
When `senderId` is passed, it allows multiple UI clients to track responses independently (critical for async operations; map senderId to callback on renderer side).

**Stateful objects:**
- `currentFinder`, `currentRemoteLogin`, `currentServer` in service.js track active connections. Cleanup/reassign on new operations (see `closeFinder()`, `closeRemoteLogin()` as examples).

**Error handling:**
Service methods validate inputs upfront (throw synchronously for missing required params), not at the boundary.

## Common Tasks

**Adding a new IPC command:**
1. Add method to `src/screenlogic-service.js`
2. Add handler in `main.js` mapping `screenlogic:commandName` to the method
3. Add mirrored method in `preload.js` calling `invoke('screenlogic:commandName', ...args)`
4. Update test file: `test/screenlogic-service.test.js`

**Testing service methods in isolation:**
Jest tests run against exported methods in screenlogic-service.js. Mock `node-screenlogic` or actual library calls depending on test scope.

**DevTools in production:**
Edit main.js: replace `if (process.env.NODE_ENV === 'development')` with simpler condition if needed for debugging.
