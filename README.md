# Agentic Company — Idea Graph

An interactive visualization of actionable ideas extracted from founder talks
(YC Startup School and others). Ideas are **nodes**, clustered by theme and sized
by how many independent speakers back them; the **edges** are cross-links showing
how ideas reinforce, relate to, or hold tension with one another.

The underlying catalog lives in `../actionable-ideas.md`. This repo is the
shareable, hostable visualization of that catalog.

## Files

- **`index.html`** — the entire site. Self-contained (no build step, no
  dependencies, no external requests). Open it directly in a browser or serve it
  as a static file. **This is the source of truth**; the graph data lives in the
  `NODES`, `EDGES`, and `TALKS` arrays inside its `<script>`.
- `_artifact.html` — a generated body-only copy used to publish the claude.ai
  artifact preview. Not needed for hosting. (Git-ignored.)

## Hosting

It's a single static file, so any static host works. Serve `index.html` at the
path you want (e.g. as the site root, or under `/ideas/`).

## Updating

When a new talk is added to `../actionable-ideas.md`:

1. Add/adjust the matching entries in the `NODES` / `EDGES` / `TALKS` arrays in
   `index.html` (mirror the markdown: node size = number of speakers, edge kind =
   reinforce / relate / tension).
2. Commit and redeploy.

## Interactions

- **Hover** a node for its idea; **click** for the full detail panel with sources.
- Filter by **consensus** (All / ≥2 / ≥3 speakers), toggle **themes**, or **search**.
- Drag nodes, scroll to zoom, drag the canvas to pan. Light/dark toggle in the header.
