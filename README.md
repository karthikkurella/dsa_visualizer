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
npm start
```

Or:

```bash
./start.sh
```

Open **http://localhost:5173** — no build step, starts in seconds.

Python loads only when you click **Run & Visualize** (first run downloads ~10 MB).

## How to Use

1. Paste your Python code in the **Code** panel (or load an example from the dropdown)
2. Add **Input (stdin)** if your solution reads from `input()`
3. Wait for "Loading Python..." to finish on first visit
4. Click **Run & Visualize**
5. Use step controls to walk through execution and inspect variables

## Deploy to Firebase (free Spark plan)

Static **Firebase Hosting** only — works on the free Spark plan, no credit card needed.

### Step 1 — Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** and follow the steps
3. You do **not** need to upgrade to Blaze

### Step 2 — One-time setup

```bash
npm install
npx firebase login
npx firebase use --add
```

Select your project when prompted. This updates `.firebaserc`.

### Step 3 — Deploy

```bash
npm run deploy
```

Or:

```bash
./deploy.sh
```

Your app will be live at:

```
https://<your-project-id>.web.app
```

You can also find the URL in the Firebase Console under **Hosting**.

### Troubleshooting

| Issue | Fix |
|-------|-----|
| `Firebase login required` | Run `npx firebase login` |
| `your-firebase-project-id` | Run `npx firebase use --add` |
| Build fails | Run `cd frontend && npm install && npm run build` |

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
