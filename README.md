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

```bash
chmod +x start.sh
./start.sh
```

Then open **http://localhost:5173**

### Manual start

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python3 -m uvicorn main:app --reload --port 8000
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
