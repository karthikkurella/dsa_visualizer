# DSA Code Visualizer

Step through your Python DSA solutions line by line. Paste code and optional stdin input, run the visualizer, and navigate execution to see how variables change at each step.

## Features

- **Paste & run** — Write or paste Python DSA code with optional competitive-programming stdin input
- **Step-by-step navigation** — First / Prev / Next / Last controls (or arrow keys / `h` / `l`)
- **Variable inspector** — See all local variables and their values at each line
- **Line highlighting** — Current executing line is highlighted in the execution view
- **Output tracking** — Watch `print()` output accumulate as execution progresses
- **Built-in examples** — Two Sum, Binary Search, BFS, and stdin input patterns

## Quick Start

One command sets up a Python virtual environment, installs dependencies, and starts both servers:

```bash
./start.sh
```

Then open **http://localhost:5173**

On first run, the script will:
1. Create a `.venv` virtual environment in the project root
2. Install Python packages from `backend/requirements.txt`
3. Install frontend npm packages (if not already installed)
4. Start the API on port 8000 and the UI on port 5173

**Requirements:** Python 3.10+, Node.js 18+, and `python3-venv` (on Ubuntu/Debian: `sudo apt install python3-venv`)

If needed, make the script executable once:

```bash
chmod +x start.sh
```

### Manual start

**Backend:**
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
cd backend
python -m uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## How to Use

1. Paste your Python code in the **Code** panel (or load an example from the dropdown)
2. Add **Input (stdin)** if your solution reads from `input()`
3. Click **Run & Visualize**
4. Use step controls to walk through execution and inspect variables

## Limitations

- Python only (no imports allowed for security)
- 5 second execution timeout
- 2000 step maximum per run
- Traces line-level execution (not individual expression evaluation)

## Tech Stack

- **Backend:** Python, FastAPI, `sys.settrace`
- **Frontend:** React, TypeScript, Vite
