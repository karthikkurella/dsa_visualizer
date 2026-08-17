# DSA Code Visualizer

Step through your Python DSA solutions line by line. Paste code and optional stdin input, run the visualizer, and navigate execution to see how variables change at each step.

**Runs entirely in your browser** using [Pyodide](https://pyodide.org/) — no server needed. Deploys on Firebase's **free Spark plan**.

## Features

- **Paste & run** — Write or paste Python DSA code with optional competitive-programming stdin input
- **Step-by-step navigation** — First / Prev / Next / Last controls (or arrow keys / `h` / `l`)
- **Variable inspector** — See all local variables and their values at each line
- **Line highlighting** — Current executing line is highlighted in the execution view
- **Output tracking** — Watch `print()` output accumulate as execution progresses
- **Built-in examples** — Two Sum, Binary Search, BFS, and stdin input patterns
- **Free to host** — Static site on Firebase Hosting (Spark plan)

## Quick Start (local)

```bash
./start.sh
```

Then open **http://localhost:5173**

The first load downloads the Python runtime (~10 MB). After that, tracing runs locally in your browser.

**Requirements:** Node.js 18+

```bash
chmod +x start.sh   # only needed once
```

### Manual start

```bash
cd frontend
npm install
npm run dev
```

## How to Use

1. Paste your Python code in the **Code** panel (or load an example from the dropdown)
2. Add **Input (stdin)** if your solution reads from `input()`
3. Wait for "Loading Python..." to finish on first visit
4. Click **Run & Visualize**
5. Use step controls to walk through execution and inspect variables

## Deploy to Firebase (free Spark plan)

No Cloud Functions or Blaze plan required — only static **Firebase Hosting**.

### One-time setup

1. Create a [Firebase project](https://console.firebase.google.com/) (Spark/free plan is fine)
2. Install the Firebase CLI and link your project:

```bash
npm install
firebase login
firebase use --add
```

### Deploy

```bash
./deploy.sh
```

Or:

```bash
npm run deploy
```

Your app will be live at `https://<your-project-id>.web.app`.

### Firebase emulator (local)

```bash
npm install
npm run build
npm run emulators
```

Open **http://localhost:5000**

## Limitations

- Python only (no imports allowed for security)
- 5 second execution timeout
- 2000 step maximum per run
- Traces line-level execution (not individual expression evaluation)
- First page load downloads the Pyodide Python runtime

## Tech Stack

- **Execution:** Python via Pyodide (WebAssembly) in the browser, `sys.settrace`
- **Frontend:** React, TypeScript, Vite
- **Deploy:** Firebase Hosting (free Spark plan)

## Project structure

- `backend/tracer.py` — Source of truth for the Python tracer (synced to frontend on build)
- `frontend/` — React app with in-browser Pyodide execution
- `firebase.json` — Hosting-only Firebase config
