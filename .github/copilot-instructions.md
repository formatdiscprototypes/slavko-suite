# Copilot / AI Agent Instructions — S.L.A.V.K.O. Enterprise Suite

Purpose: concise, actionable guidance so coding agents are productive immediately.

- **Big picture:** S.L.A.V.K.O is a deterministic AI orchestration suite focused on reproducible, auditable outputs.
  - Core flow: `SlavkoShell` → `SlavkoFusion` → `SlavkoScore` → `SlavkoKernel` → audit trail (JSON + Markdown).
  - Determinism is first-class: the `Determinism_Guide.md` in `docs/` documents required runtime invariants.

- **Where to look first:**
  - High level: `README.md` (root)
  - Determinism rules: `docs/Determinism_Guide.md`
  - Component docs: `docs/README_SlavkoShell_2_0.md`, `docs/README_SlavkoKernel_v8.md`, `docs/README_SlavkoScore_4_x.md`
  - Schemas and wire contracts: `schemas/*.json` (kernel.json, score.json, fusion.json, audit.json)
  - Agent lifecycle hooks: `.agent_hooks/` (startup/shutdown hooks)

- **Developer workflows / commands (concrete):**
  - Install (Python package): `pip install -e .`
  - Run evaluation API: `python -m slavko_score.api` (default port 8000)
  - Docker quickstart: `docker-compose up -d`
  - Ollama model runs (examples in README):
    - `ollama run mladen-gertner/slavkoscore-4.0:deepseek`
  - Verify deterministic behavior with provided test in `docs/Determinism_Guide.md`.

- **Project-specific conventions:**
  - Determinism must hold: `temperature=0`, `top_p=0`, `stream=False`, seeded RNG at process start (see `Determinism_Guide.md`).
  - Sequential processing per container: orchestrator uses `max_concurrent_requests=1` by default for determinism.
  - Dual outputs: handlers must emit both `markdown` and `json` in responses; follow `API_Reference.md`.
  - Cache-first evaluation: check cache key (SHA256 over input) before any model call (examples in `Determinism_Guide.md`).

- **Integration points:**
  - Ollama modelfiles under `ollama/modelfiles/` — use those Modelfile presets for local inference.
  - Schemas in `schemas/` are authoritative for payload validation; update `api` consumers when changing.
  - Hooks in `.agent_hooks/` run lifecycle scripts — register new agents with those hooks.

- **Safe-edit rules for AI agents:**
  - When changing core orchestrator code (e.g., `slavko-kernel`, `slavko-shell`, `SlavkoScore`), run `python -m slavko_score.api` and the deterministic tests locally.
  - If you alter a schema, update corresponding `schemas/*.json` and `docs/API_Reference.md` and search for usages across the codebase.
  - Never enable streaming or temperature changes in default configs without adding a deterministic-override test and updating `Determinism_Guide.md`.

- **Examples to follow:**
  - Add a new model preset: add Modelfile to `ollama/modelfiles/` and reference it in `docs` and deployment manifests.
  - Add an agent startup behavior: add a numbered script (e.g., `10_new_behavior.py`) to the `.agent_hooks/startup/` directory. The `run_all_hooks.py` script executes hooks automatically.

- **When blocked / missing secrets:**
  - Ask for `OLLAMA_API_KEY`, `GEMINI_API_KEY`, and `SLAVKO_NODE_ID` before running components that use remote models or start the kernel.

If you want, I can (a) generate a short checklist for running end-to-end locally (commands and ports), or (b) expand the examples with exact code snippets from the `slavko-shell` and `slavko-kernel` components.
