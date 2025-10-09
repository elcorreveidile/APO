# Repository Guidelines

## Project Structure & Module Organization
The app is a static web bundle rooted in the repository root. `index.html`, `levels.html`, `subjects.html`, and `progress.html` drive the key views, while `main-fixed.js` and `navigation-fix.js` hold the application logic and navigation helpers. Assets live under `resources/` (images and icons) and design notes remain in `debug.md`, `design.md`, and related docs for context. Keep new scripts alongside the existing JavaScript files and reference them from the appropriate HTML entry point.

## Build, Test, and Development Commands
No build tooling is required; load the HTML directly or serve it locally to unlock microphone APIs. Typical workflow: `python3 -m http.server 8000` from the repo root, then browse to `http://localhost:8000/index.html`. Node users can run `npx serve . --listen 8080`. Always test on at least one mobile browser emulator to validate touch interactions.

## Coding Style & Naming Conventions
Follow the existing ES6 style: four-space indentation, `const`/`let` over `var`, and early returns for guard clauses. JavaScript classes (see `SpanishFlowApp` in `main-fixed.js`) encapsulate feature logic; extend them rather than introducing globals. Keep file names lowercase with hyphens (`progress-tracker.js`) and ensure new assets join `resources/` with descriptive names. Comment sparingly—focus on intent or complex algorithm notes.

## Testing Guidelines
Automated tests are not configured, so lean on manual QA aligned with the checklist in `README.md`. After each change, reload the served pages, grant microphone permissions, and confirm recording, playback, navigation, and progress storage still work. Capture console output with `Cmd+Option+J` (Chrome) when verifying error handling. If adding substantial logic, add a short test plan to the PR description so reviewers can replicate the scenario.

## Commit & Pull Request Guidelines
Existing history is lean, so adopt concise, imperative commit messages (`Add waveform smoothing guard`). Group related changes together and avoid mixing feature work with large asset drops unless necessary. Pull requests should outline the change, link any tracking issues, include before/after screenshots or screen recordings for UI updates, and list manual test steps performed. Request review from another contributor before merging and wait for CI (if introduced later) to pass.

## Security & Configuration Notes
Media recording requires HTTPS in production; test locally via the recommended development servers or a secure tunnel (e.g., `npx localtunnel`). Store only non-sensitive data in `localStorage`, and clear it when introducing incompatible schema changes (`localStorage.removeItem('spanishflow_recordings')`). Validate microphone permissions on each load and fail gracefully with user-facing messaging when unavailable.
