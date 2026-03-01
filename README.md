# Lume MVP — Sketch to React UI

Demo-focused MVP for an AI-assisted UI creation tool.

Users sketch rough UI on a canvas, the system interprets shapes into UI components,
shows an interactive live preview, applies Copilot-style text refinements, and generates editable React code.

## Tech Stack

- React + Vite
- Fabric.js for drawing canvas
- Rule-based shape interpreter (no ML)
- Mock Copilot refinement function (LLM-ready integration point)

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm run dev
```

3. Open the URL shown by Vite (usually `http://localhost:5173`).

## MVP Feature Coverage

- Drawing canvas with:
	- freehand strokes
	- rectangle, circle, line tools
	- select, undo, clear
- Rule-based shape detection and interpretation:
	- rectangle → Button/Card/Input
	- horizontal line → Slider
	- circle → Button (icon-like)
	- freehand path → heuristic fallback to Button/Card/Slider
- Live interactive preview:
	- clickable buttons
	- movable sliders
	- editable inputs
- AI Copilot mode (text prompt):
	- style/profile refinement (`minimal`, `playful`, `soft`, `romantic`, `heart`)
	- component style + prop adjustments
- Code generation + export:
	- generated reusable React component code
	- copy-to-clipboard export

## File Structure

```text
src/
	components/
		DrawingCanvas.jsx
		DrawingCanvas.css
		PreviewPanel.jsx
		PreviewPanel.css
	lib/
		shapeInterpreter.js
		copilot.js
		codeGenerator.js
	App.jsx
	App.css
	index.css
```

## Example Demo Flow

1. Draw a rectangle and a horizontal line on the canvas.
2. See auto-detected components appear in the Live Preview.
3. Type: `soft colors, romantic vibe` and click **Apply**.
4. Interact with generated button/slider/input in preview.
5. Click **Copy Generated Code** and paste into a React project.

## Notes

- The interpreter is intentionally forgiving and heuristic-driven.
- Copilot mode is assistive, not autonomous.
- Designed for speed of iteration and investor demos, not production fidelity.
